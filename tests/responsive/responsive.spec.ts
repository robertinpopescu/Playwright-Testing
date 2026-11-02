import type { Locator } from "@playwright/test"
import { expect, knownBug, test } from "../../fixtures"

// Runs only in the tablet and mobile projects (see playwright.config.ts)

// Below Bootstrap's "sm" breakpoint the New Visit form is wider than the screen (BUG-017)
const BOOTSTRAP_SM_BREAKPOINT_PX = 768

test("RSP-001 Mobile navigation menu", { tag: "@responsive" }, async ({ page, navBar }) => {
  const checks = [
    { open: () => navBar.openOwnersSearch(), heading: "Owners" },
    { open: () => navBar.openOwnersAddNew(), heading: "New Owner" },
    { open: () => navBar.openVetsAll(), heading: "Veterinarians" },
    { open: () => navBar.openVetsAddNew(), heading: "New Veterinarian" },
    { open: () => navBar.openPetTypes(), heading: "Pet Types" },
    { open: () => navBar.openSpecialties(), heading: "Specialties" },
    { open: () => navBar.openHome(), heading: "Welcome to Petclinic" }
  ]
  await page.goto("/")

  for (const { open, heading } of checks) {
    await open()
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible()
  }
})

test("RSP-002 No horizontal page scroll on tablet and mobile", { tag: "@responsive" }, async ({ page, data, ownersPage, vetsPage, petTypesPage, specialtiesPage, ownerDetails, petForm, visitForm }) => {
  const owner = await data.owner()
  const pet = await data.pet(owner)
  // ready: the content that sets the page width has rendered
  const firstRow = (rows: Locator) => () => expect(rows.first()).toBeVisible()
  const firstField = () => expect(page.getByRole("textbox").first()).toBeVisible()
  const pages: { path: string, heading: string, ready: () => Promise<void>, bugBelowSm?: string }[] = [
    { path: "/owners", heading: "Owners", ready: firstRow(ownersPage.ownerRows) },
    { path: "/owners/add", heading: "New Owner", ready: firstField },
    { path: "/vets", heading: "Veterinarians", ready: firstRow(vetsPage.rows) },
    { path: "/vets/add", heading: "New Veterinarian", ready: firstField },
    { path: "/pettypes", heading: "Pet Types", ready: firstRow(petTypesPage.rows) },
    { path: "/specialties", heading: "Specialties", ready: firstRow(specialtiesPage.rows) },
    { path: `/owners/${owner.id}`, heading: "Owner Information", ready: () => expect(ownerDetails.pet(pet.name)).toBeVisible() },
    { path: `/owners/${owner.id}/pets/add`, heading: "Add Pet", ready: () => petForm.waitUntilLoaded() },
    { path: `/pets/${pet.id}/visits/add`, heading: "New Visit", ready: () => visitForm.waitUntilLoaded(), bugBelowSm: "BUG-017" }
  ]

  const overflowing: { summary: string, bug?: string }[] = []
  let screenWidth = 0
  for (const { path, heading, ready, bugBelowSm } of pages) {
    await page.goto(path)
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible()
    await ready()
    await expect(page.getByRole("progressbar")).toHaveCount(0)
    // Mobile browsers widen the layout viewport to fit wide content, so the page width is
    // compared with the device screen width, not with window.innerWidth
    const widths = await page.evaluate(() => ({
      pageWidth: Math.max(document.documentElement.scrollWidth, window.innerWidth),
      screenWidth: window.screen.width
    }))
    screenWidth = widths.screenWidth
    if (widths.pageWidth > widths.screenWidth) {
      overflowing.push({
        summary: `${path.replace(/\d+/g, "{id}")}: ${widths.pageWidth}px > ${widths.screenWidth}px`,
        bug: widths.screenWidth < BOOTSTRAP_SM_BREAKPOINT_PX ? bugBelowSm : undefined
      })
    }
  }

  test.info().annotations.push({ type: "overflow", description: overflowing.map(entry => entry.summary).join("; ") || "none" })
  expect(overflowing.filter(entry => !entry.bug).map(entry => entry.summary), "overflow not linked to a known bug").toEqual([])
  if (screenWidth < BOOTSTRAP_SM_BREAKPOINT_PX) {
    await knownBug("BUG-017", async () => {
      expect(overflowing.map(entry => entry.summary)).toEqual([])
    })
  }
})
