// Shapes of the PetClinic API resources, as observed in real responses (Phase 4 check).

export interface PetType {
  id: number
  name: string
}

export interface Specialty {
  id: number
  name: string
}

export interface Visit {
  id: number
  date: string
  description: string
  petId: number
}

export interface Pet {
  id: number
  name: string
  birthDate: string
  type: PetType
  ownerId: number
  visits: Visit[]
}

export interface Owner {
  id: number
  firstName: string
  lastName: string
  address: string
  city: string
  telephone: string
  pets: Pet[]
}

export interface Vet {
  id: number
  firstName: string
  lastName: string
  specialties: Specialty[]
}

export type OwnerInput = Omit<Owner, "id" | "pets">
export type PetInput = { name: string, birthDate: string, type: PetType }
export type VisitInput = { date: string, description: string }
export type VetInput = { firstName: string, lastName: string, specialties: Specialty[] }
