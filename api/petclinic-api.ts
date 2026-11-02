import type { APIRequestContext, APIResponse } from "@playwright/test"
import type { Owner, OwnerInput, Pet, PetInput, PetType, Specialty, Vet, VetInput, Visit, VisitInput } from "./types"

export type Resource = "owners" | "pets" | "visits" | "vets" | "specialties" | "pettypes"

// Typed helpers for test setup and verification. Every call checks the status code the
// API was observed to return, so a broken setup step fails with a clear message instead
// of a confusing error later in the test.
export class PetclinicApi {
  constructor(private readonly request: APIRequestContext) {}

  async createOwner(owner: OwnerInput): Promise<Owner> {
    return this.json(await this.request.post("owners", { data: owner }), 201, "create owner")
  }

  async createPet(ownerId: number, pet: PetInput): Promise<Pet> {
    return this.json(await this.request.post(`owners/${ownerId}/pets`, { data: pet }), 201, "create pet")
  }

  async createVisit(ownerId: number, petId: number, visit: VisitInput): Promise<Visit> {
    return this.json(await this.request.post(`owners/${ownerId}/pets/${petId}/visits`, { data: visit }), 201, "create visit")
  }

  async createVet(vet: VetInput): Promise<Vet> {
    return this.json(await this.request.post("vets", { data: vet }), 201, "create vet")
  }

  async createSpecialty(name: string): Promise<Specialty> {
    return this.json(await this.request.post("specialties", { data: { name } }), 201, "create specialty")
  }

  async createPetType(name: string): Promise<PetType> {
    return this.json(await this.request.post("pettypes", { data: { name } }), 201, "create pet type")
  }

  async getOwner(id: number): Promise<Owner> {
    return this.json(await this.request.get(`owners/${id}`), 200, `get owner ${id}`)
  }

  async getPet(id: number): Promise<Pet> {
    return this.json(await this.request.get(`pets/${id}`), 200, `get pet ${id}`)
  }

  async getVisit(id: number): Promise<Visit> {
    return this.json(await this.request.get(`visits/${id}`), 200, `get visit ${id}`)
  }

  async getVet(id: number): Promise<Vet> {
    return this.json(await this.request.get(`vets/${id}`), 200, `get vet ${id}`)
  }

  async listOwners(): Promise<Owner[]> {
    return this.json(await this.request.get("owners"), 200, "list owners")
  }

  // The API answers 404 instead of [] when nothing matches (OBS-001), so 404 means "none"
  async findOwnersByLastName(lastName: string): Promise<Owner[]> {
    const response = await this.request.get("owners", { params: { lastName } })
    if (response.status() === 404) return []
    return this.json(response, 200, `search owners "${lastName}"`)
  }

  async listPets(): Promise<Pet[]> {
    return this.json(await this.request.get("pets"), 200, "list pets")
  }

  async listVets(): Promise<Vet[]> {
    return this.json(await this.request.get("vets"), 200, "list vets")
  }

  async listPetTypes(): Promise<PetType[]> {
    return this.json(await this.request.get("pettypes"), 200, "list pet types")
  }

  async listSpecialties(): Promise<Specialty[]> {
    return this.json(await this.request.get("specialties"), 200, "list specialties")
  }

  async petType(name: string): Promise<PetType> {
    const petType = (await this.listPetTypes()).find(type => type.name === name)
    if (!petType) throw new Error(`Pet type "${name}" not found`)
    return petType
  }

  async specialty(name: string): Promise<Specialty> {
    const specialty = (await this.listSpecialties()).find(item => item.name === name)
    if (!specialty) throw new Error(`Specialty "${name}" not found`)
    return specialty
  }

  async status(resource: Resource, id: number): Promise<number> {
    return (await this.request.get(`${resource}/${id}`)).status()
  }

  // Returns the status so cleanup can accept 404 for records the test already deleted
  async delete(resource: Resource, id: number): Promise<number> {
    return (await this.request.delete(`${resource}/${id}`)).status()
  }

  private async json<T>(response: APIResponse, expectedStatus: number, action: string): Promise<T> {
    if (response.status() !== expectedStatus) {
      throw new Error(`API ${action}: expected ${expectedStatus}, got ${response.status()} ${(await response.text()).slice(0, 200)}`)
    }
    return response.json() as Promise<T>
  }
}
