import type { PetclinicApi, Resource } from "../api/petclinic-api"
import type { Owner, Pet } from "../api/types"
import { stampOf } from "./naming"

// Finds and removes records left behind by earlier runs. A record counts as test data only
// if its name matches the exact test naming pattern (test-data/naming.ts); for owners and
// vets either the first or the last name may match. Pets and visits of a test owner are
// test data too (tests never add pets to existing owners).

export interface TestRecord {
  type: Resource
  id: number
  name: string
  stamp: string
  // Set when the record must not be deleted, with the reason
  skipReason?: string
}

const DELETED = 204
const ALREADY_GONE = 404

// Children first: visits, then pets, then owners; vets before specialties; pet types last,
// because deleting a pet type also deletes the pets that use it (BUG-009)
const DELETE_ORDER: Resource[] = ["visits", "pets", "owners", "vets", "specialties", "pettypes"]

function personStamp(person: { firstName: string, lastName: string }): string | undefined {
  const stamps = [stampOf(person.firstName), stampOf(person.lastName)].filter((stamp): stamp is string => stamp !== undefined)
  // The newest stamp decides, so a record touched by the current run is never counted as old
  return stamps.sort().at(-1)
}

export async function findTestRecords(api: PetclinicApi): Promise<TestRecord[]> {
  const [owners, pets, vets, specialties, petTypes] = await Promise.all([
    api.listOwners(), api.listPets(), api.listVets(), api.listSpecialties(), api.listPetTypes()
  ])
  const records: TestRecord[] = []

  const testOwners = new Map<number, string>()
  for (const owner of owners) {
    const stamp = personStamp(owner)
    if (stamp) testOwners.set(owner.id, stamp)
  }
  const ownerName = (owner: Owner) => `${owner.firstName} ${owner.lastName}`
  const testPets = new Map<number, string>()
  for (const pet of pets) {
    const stamp = testOwners.get(pet.ownerId) ?? stampOf(pet.name)
    if (!stamp) continue
    testPets.set(pet.id, stamp)
    for (const visit of pet.visits) records.push({ type: "visits", id: visit.id, name: `${visit.date} ${visit.description} (pet ${pet.id})`, stamp })
    records.push({ type: "pets", id: pet.id, name: `${pet.name} (owner ${pet.ownerId})`, stamp })
  }
  for (const owner of owners) {
    const stamp = testOwners.get(owner.id)
    if (stamp) records.push({ type: "owners", id: owner.id, name: ownerName(owner), stamp })
  }

  for (const vet of vets) {
    const stamp = personStamp(vet)
    if (stamp) records.push({ type: "vets", id: vet.id, name: `${vet.firstName} ${vet.lastName}`, stamp })
  }
  const testVetIds = new Set(records.filter(record => record.type === "vets").map(record => record.id))

  for (const specialty of specialties) {
    const stamp = stampOf(specialty.name)
    if (!stamp) continue
    const usedByExistingVet = vets.some(vet => !testVetIds.has(vet.id) && vet.specialties.some(item => item.id === specialty.id))
    records.push({ type: "specialties", id: specialty.id, name: specialty.name, stamp, skipReason: usedByExistingVet ? "assigned to an existing vet" : undefined })
  }

  for (const petType of petTypes) {
    const stamp = stampOf(petType.name)
    if (!stamp) continue
    const usedByExistingPet = pets.some((pet: Pet) => !testPets.has(pet.id) && pet.type.id === petType.id)
    records.push({ type: "pettypes", id: petType.id, name: petType.name, stamp, skipReason: usedByExistingPet ? "used by an existing pet (deleting it would delete that pet, BUG-009)" : undefined })
  }

  return records.sort((a, b) => DELETE_ORDER.indexOf(a.type) - DELETE_ORDER.indexOf(b.type))
}

export interface SweepResult {
  matched: TestRecord[]
  deleted: TestRecord[]
  skipped: TestRecord[]
  failed: { record: TestRecord, reason: string }[]
}

// Deletes test records from runs that started before currentStamp, in dependency order.
// dryRun only reports what would be deleted.
export async function sweepTestData(api: PetclinicApi, options: { currentStamp: string, dryRun: boolean, log: (line: string) => void }): Promise<SweepResult> {
  const { currentStamp, dryRun, log } = options
  const matched = (await findTestRecords(api)).filter(record => record.stamp < currentStamp)
  const result: SweepResult = { matched, deleted: [], skipped: [], failed: [] }
  const describe = (record: TestRecord) => `${record.type} ${record.id} "${record.name}"`

  for (const record of matched) {
    if (record.skipReason) {
      result.skipped.push(record)
      log(`skipped ${describe(record)}: ${record.skipReason}`)
      continue
    }
    if (dryRun) {
      log(`would delete ${describe(record)}`)
      continue
    }
    try {
      const status = await api.delete(record.type, record.id)
      if (status === DELETED || status === ALREADY_GONE) {
        result.deleted.push(record)
        log(`deleted ${describe(record)}${status === ALREADY_GONE ? " (already gone)" : ""}`)
      } else {
        result.failed.push({ record, reason: `status ${status}` })
        log(`FAILED ${describe(record)}: status ${status}`)
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message.split("\n")[0] : String(error)
      result.failed.push({ record, reason })
      log(`FAILED ${describe(record)}: ${reason}`)
    }
  }
  return result
}
