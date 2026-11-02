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
}

export const test = apiTest.extend<Fixtures>({
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

// Runs the assertion that describes a confirmed bug (the correct behaviour). Only this
// callback is inverted: setup steps outside it fail the test normally, so a broken setup
// can never look like "bug still present".
// - bug still present (assertion fails) -> test passes, annotation "known-bug"
// - assertion passes -> test fails: the bug seems fixed, update BUG-REPORTS.md
// VERIFY_KNOWN_BUGS=1 runs the assertion without inversion, to see its real failure message.
export async function knownBug(bugId: string, correctBehaviour: () => Promise<void>): Promise<void> {
  test.info().annotations.push({ type: "issue", description: `${bugId} – docs/BUG-REPORTS.md#${bugId.toLowerCase()}` })
  if (process.env.VERIFY_KNOWN_BUGS === "1") return correctBehaviour()

  try {
    await correctBehaviour()
  } catch (error) {
    const reason = error instanceof Error ? error.message.split("\n")[0] : String(error)
    test.info().annotations.push({ type: "known-bug", description: `${bugId} still present: ${reason}` })
    return
  }
  throw new Error(`${bugId} seems fixed: the correct behaviour was observed. Update docs/BUG-REPORTS.md and remove knownBug() from this test.`)
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
