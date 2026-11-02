import type { OwnerInput, VisitInput } from "../api/types"
import { randomText, testName } from "./naming"

export { isTestName, testName } from "./naming"

// Random letters for values that are not record names: descriptions, search texts, URLs
export function unique(): string {
  return randomText()
}

// Name for a record a test creates; the label must be one capital + lowercase letters
export function uniqueName(label: string = ""): string {
  return testName(label)
}

export function ownerData(overrides: Partial<OwnerInput> = {}): OwnerInput {
  return {
    firstName: uniqueName(),
    lastName: uniqueName(),
    address: "1 Test St",
    city: "Testville",
    telephone: "6085550000",
    ...overrides
  }
}

export function petName(): string {
  return uniqueName("Rex")
}

// The API uses yyyy-MM-dd, the date picker fields display yyyy/MM/dd
export const PET_BIRTH_DATE = { api: "2020-01-15", ui: "2020/01/15" }
export const VISIT_DATE = { api: "2024-03-10", ui: "2024/03/10" }

export function visitData(overrides: Partial<VisitInput> = {}): VisitInput {
  return { date: VISIT_DATE.api, description: `Checkup ${unique()}`, ...overrides }
}
