import type { Page, Request } from "@playwright/test"
import { PetclinicApi } from "../api/petclinic-api"
import { PetTypesPage, SpecialtiesPage } from "../pages/InlineListPage"
import { NavBar } from "../pages/NavBar"
import { OwnerDetailsPage } from "../pages/OwnerDetailsPage"
import { OwnerFormPage } from "../pages/OwnerFormPage"
import { OwnersPage } from "../pages/OwnersPage"
import { PetFormPage } from "../pages/PetFormPage"
import { VetFormPage } from "../pages/VetFormPage"
import { VetsPage } from "../pages/VetsPage"
import { VisitFormPage } from "../pages/VisitFormPage"
import { test as apiTest } from "./api"
import { TestData } from "./test-data"

// Annotation type added by knownBug() when the bug assertion fails
const KNOWN_BUG = "known-bug"

type Fixtures = {
  petclinic: PetclinicApi
  data: TestData
  navBar: NavBar
  ownersPage: OwnersPage
  ownerForm: OwnerFormPage
  ownerDetails: OwnerDetailsPage
  petForm: PetFormPage
  visitForm: VisitFormPage
  vetsPage: VetsPage
  vetForm: VetFormPage
  petTypesPage: PetTypesPage
  specialtiesPage: SpecialtiesPage
  knownBugGuard: void
}

export const test = apiTest.extend<Fixtures>({
  // A known-bug test may only fail at its bug assertion. If it failed anywhere else as well
  // (e.g. a cleanup error after the bug check), the failure is reported as a real one
  // instead of "expected to fail".
  knownBugGuard: [async ({}, use, testInfo) => {
    await use()
    const failedOnlyAtBug = testInfo.annotations.some(annotation => annotation.type === KNOWN_BUG) && testInfo.errors.length === 1
    if (testInfo.expectedStatus === "failed" && testInfo.status === "failed" && !failedOnlyAtBug) testInfo.expectedStatus = "passed"
  }, { auto: true }],

  petclinic: async ({ api }, use) => {
    await use(new PetclinicApi(api))
  },

  // Deletes every registered record after the test, also when the test failed
  data: async ({ petclinic }, use) => {
    const data = new TestData(petclinic)
    await use(data)
    await data.cleanup()
  },

  navBar: async ({ page }, use) => use(new NavBar(page)),
  ownersPage: async ({ page }, use) => use(new OwnersPage(page)),
  ownerForm: async ({ page }, use) => use(new OwnerFormPage(page)),
  ownerDetails: async ({ page }, use) => use(new OwnerDetailsPage(page)),
  petForm: async ({ page }, use) => use(new PetFormPage(page)),
  visitForm: async ({ page, isMobile }, use) => use(new VisitFormPage(page, isMobile)),
  vetsPage: async ({ page }, use) => use(new VetsPage(page)),
  vetForm: async ({ page }, use) => use(new VetFormPage(page)),
  petTypesPage: async ({ page }, use) => use(new PetTypesPage(page)),
  specialtiesPage: async ({ page }, use) => use(new SpecialtiesPage(page))
})

export { expect } from "@playwright/test"

// Runs the assertion that describes a confirmed bug (the correct behaviour) and marks the
// test with test.fail() at that point, so Playwright reports it as "expected to fail".
// - bug still present (assertion fails) -> expected failure, annotation "known-bug"
// - assertion passes -> "Expected to fail, but passed": the bug seems fixed, update BUG-REPORTS.md
// Setup steps before the call fail the test normally (test.fail() is not set yet), and the
// knownBugGuard fixture turns any other error into a real failure.
// VERIFY_KNOWN_BUGS=1 runs the assertion as a normal one, to see its real failure message.
export async function knownBug(bugIds: string | string[], correctBehaviour: () => Promise<void>): Promise<void> {
  const ids = typeof bugIds === "string" ? [bugIds] : bugIds
  const info = test.info()
  for (const id of ids) info.annotations.push({ type: "issue", description: `${id} – docs/BUG-REPORTS.md#${id.toLowerCase()}` })
  if (process.env.VERIFY_KNOWN_BUGS === "1") return correctBehaviour()

  test.fail(true, `${ids.join(", ")} open: expected to fail until fixed`)
  try {
    await correctBehaviour()
  } catch (error) {
    const reason = error instanceof Error ? error.message.split("\n")[0] : String(error)
    info.annotations.push({ type: KNOWN_BUG, description: `${ids.join(", ")} still present: ${reason}` })
    throw error
  }
}

const REQUEST_WAIT_MS = 3000

// Performs an action and returns the matching API request it triggered, or null if none
// was sent within the wait. Used by "nothing is submitted" checks, which would otherwise
// pass simply because they ran before the request.
export async function requestDuring(page: Page, matches: (request: Request) => boolean, action: () => Promise<void>): Promise<Request | null> {
  const request = page.waitForRequest(matches, { timeout: REQUEST_WAIT_MS }).catch(() => null)
  await action()
  return request
}

export function fullName(person: { firstName: string, lastName: string }): string {
  return `${person.firstName} ${person.lastName}`
}
