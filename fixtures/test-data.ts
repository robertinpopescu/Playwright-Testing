import type { PetclinicApi, Resource } from "../api/petclinic-api"
import type { Owner, OwnerInput, Pet, PetType, Specialty, Vet, Visit, VisitInput } from "../api/types"
import { isTestName, ownerData, PET_BIRTH_DATE, petName, uniqueName, visitData } from "../test-data/builders"

// Children before parents, so a delete never fails because a record is still referenced.
// Owners are deleted together with their pets and visits (see deleteOwner).
const CLEANUP_ORDER: Exclude<Resource, "owners">[] = ["visits", "pets", "vets", "specialties", "pettypes"]

type WatchedResource = "vets" | "specialties" | "pettypes"

const DELETED = 204
const ALREADY_GONE = 404

// Only these records may be removed by a watch: empty names or the test naming pattern,
// so pre-existing data is never touched
function isTestRecord(record: { name?: string, firstName?: string, lastName?: string }): boolean {
  const names = [record.name, record.firstName, record.lastName].filter((name): name is string => name !== undefined)
  return names.some(name => name.trim() === "" || isTestName(name))
}

// Creates setup records via the API and remembers them; cleanup() deletes them by id,
// also when the test failed. Records a test creates through the UI are registered with
// track(), expectOwner() (before the risky steps) or watch() (for "nothing is created" tests).
export class TestData {
  private readonly created = new Map<Resource, Set<number>>()
  private readonly expectedOwnerLastNames = new Set<string>()
  private readonly watched = new Map<WatchedResource, Set<number>>()

  constructor(readonly api: PetclinicApi) {}

  track(resource: Resource, id: number): void {
    const ids = this.created.get(resource) ?? new Set<number>()
    this.created.set(resource, ids.add(id))
  }

  async owner(overrides: Partial<OwnerInput> = {}): Promise<Owner> {
    const owner = await this.api.createOwner(ownerData(overrides))
    this.track("owners", owner.id)
    return owner
  }

  async pet(owner: Owner, typeName: string = "dog"): Promise<Pet> {
    return this.petOfType(owner, await this.api.petType(typeName))
  }

  async petOfType(owner: Owner, type: PetType): Promise<Pet> {
    const pet = await this.api.createPet(owner.id, { name: petName(), birthDate: PET_BIRTH_DATE.api, type })
    this.track("pets", pet.id)
    return pet
  }

  async visit(owner: Owner, pet: Pet, overrides: Partial<VisitInput> = {}): Promise<Visit> {
    const visit = await this.api.createVisit(owner.id, pet.id, visitData(overrides))
    this.track("visits", visit.id)
    return visit
  }

  async vet(specialties: Specialty[] = []): Promise<Vet> {
    const vet = await this.api.createVet({ firstName: uniqueName(), lastName: uniqueName(), specialties })
    this.track("vets", vet.id)
    return vet
  }

  async specialty(name: string = uniqueName("Spec")): Promise<Specialty> {
    const specialty = await this.api.createSpecialty(name)
    this.track("specialties", specialty.id)
    return specialty
  }

  async petType(name: string = uniqueName("Type")): Promise<PetType> {
    const petType = await this.api.createPetType(name)
    this.track("pettypes", petType.id)
    return petType
  }

  // Call BEFORE submitting a UI form that may create an owner: cleanup then deletes every
  // owner with this unique last name, even if the test fails before it looks them up
  expectOwner(lastName: string): void {
    this.expectedOwnerLastNames.add(lastName)
  }

  async findOwnersByLastName(lastName: string): Promise<Owner[]> {
    return this.api.findOwnersByLastName(lastName)
  }

  // Remembers the current records; cleanup deletes test-like records that appeared since
  async watch(resource: WatchedResource): Promise<void> {
    this.watched.set(resource, new Set(await this.listIds(resource)))
  }

  async cleanup(): Promise<void> {
    const failures: string[] = []
    const attempt = async (label: string, remove: () => Promise<number>): Promise<void> => {
      try {
        const status = await remove()
        if (status !== DELETED && status !== ALREADY_GONE) failures.push(`${label} -> ${status}`)
      } catch (error) {
        failures.push(`${label} -> ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`)
      }
    }

    for (const lastName of this.expectedOwnerLastNames) {
      try {
        for (const owner of await this.api.findOwnersByLastName(lastName)) this.track("owners", owner.id)
      } catch (error) {
        failures.push(`find owners "${lastName}" -> ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    for (const [resource, before] of this.watched) {
      try {
        for (const record of await this.listRecords(resource)) {
          if (!before.has(record.id) && isTestRecord(record)) this.track(resource, record.id)
        }
      } catch (error) {
        failures.push(`watch ${resource} -> ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    for (const resource of CLEANUP_ORDER) {
      if (resource === "vets") {
        for (const id of this.created.get("owners") ?? []) await this.deleteOwner(id, attempt)
      }
      for (const id of this.created.get(resource) ?? []) await attempt(`${resource}/${id}`, () => this.api.delete(resource, id))
    }

    this.created.clear()
    this.expectedOwnerLastNames.clear()
    this.watched.clear()
    if (failures.length > 0) throw new Error(`Test data cleanup failed: ${failures.join(", ")}`)
  }

  // Deletes the owner's visits and pets first, including ones a test created through the UI
  private async deleteOwner(id: number, attempt: (label: string, remove: () => Promise<number>) => Promise<void>): Promise<void> {
    if (await this.api.status("owners", id) === 200) {
      const owner = await this.api.getOwner(id)
      for (const pet of owner.pets) {
        for (const visit of pet.visits) await attempt(`visits/${visit.id}`, () => this.api.delete("visits", visit.id))
        await attempt(`pets/${pet.id}`, () => this.api.delete("pets", pet.id))
      }
    }
    await attempt(`owners/${id}`, () => this.api.delete("owners", id))
  }

  private async listRecords(resource: WatchedResource): Promise<(Vet | Specialty | PetType)[]> {
    if (resource === "vets") return this.api.listVets()
    if (resource === "specialties") return this.api.listSpecialties()
    return this.api.listPetTypes()
  }

  private async listIds(resource: WatchedResource): Promise<number[]> {
    return (await this.listRecords(resource)).map(record => record.id)
  }
}
