import AxeBuilder from "@axe-core/playwright"
import type { Locator, Page } from "@playwright/test"
import { expect, test } from "../../fixtures"
import { ownerData } from "../../test-data/builders"

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]

const STATIC_PAGES = [
  { path: "/", heading: "Welcome to Petclinic" },
  { path: "/owners", heading: "Owners" },
  { path: "/owners/add", heading: "New Owner" },
  { path: "/vets", heading: "Veterinarians" },
  { path: "/vets/add", heading: "New Veterinarian" },
  { path: "/pettypes", heading: "Pet Types" },
  { path: "/specialties", heading: "Specialties" }
]

const NAME_CHECK_TIMEOUT_MS = 1000

// Uses Playwright's own accessible-name computation (the same one getByRole relies on)
async function hasAccessibleName(field: Locator): Promise<boolean> {
  return expect(field).toHaveAccessibleName(/\S/, { timeout: NAME_CHECK_TIMEOUT_MS }).then(() => true, () => false)
}

test.describe("A11Y-001 Automated axe scan", { tag: "@a11y" }, () => {
  for (const { path, heading } of STATIC_PAGES) {
    test(`A11Y-001 axe scan: ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible()

      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

      const summary = results.violations.map(violation => `${violation.id} (${violation.impact}, ${violation.nodes.length} node(s))`)
      test.info().annotations.push({ type: "axe-violations", description: summary.join("; ") || "none" })
      expect(summary).toEqual([])
    })
  }

  test("A11Y-001 axe scan: owner details, Add Pet and New Visit", async ({ page, ownerDetails, petForm, visitForm, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const screens = [
      { name: "owner details", open: async () => { await ownerDetails.goto(owner.id); await expect(ownerDetails.field("Name")).not.toBeEmpty() } },
      { name: "Add Pet", open: async () => { await page.goto(`/owners/${owner.id}/pets/add`); await petForm.waitUntilLoaded() } },
      { name: "New Visit", open: async () => { await page.goto(`/pets/${pet.id}/visits/add`); await expect(visitForm.petTable).toContainText(pet.name) } }
    ]

    const found: string[] = []
    for (const screen of screens) {
      await screen.open()
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
      found.push(...results.violations.map(violation => `${screen.name}: ${violation.id} (${violation.impact}, ${violation.nodes.length} node(s))`))
    }
    test.info().annotations.push({ type: "axe-violations", description: found.join("; ") || "none" })
    expect(found).toEqual([])
  })
})

// Presses Tab until the target has focus; false if it is never reached
async function tabTo(page: Page, target: Locator, maxTabs: number): Promise<boolean> {
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press("Tab")
    // evaluateAll does not wait for the element, so a missing target counts as "not reached"
    if (await target.evaluateAll(elements => elements.some(element => element === document.activeElement))) return true
  }
  return false
}

const MAX_TABS = 15

test("A11Y-002 Navbar works with the keyboard only", { tag: "@a11y" }, async ({ page, navBar }) => {
  for (const { menu, heading } of [
    { menu: "Owners", heading: "New Owner" },
    { menu: "Veterinarians", heading: "New Veterinarian" }
  ] as const) {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "Welcome to Petclinic" })).toBeVisible()
    const dropdown = navBar.dropdown(menu)

    expect(await tabTo(page, dropdown.getByRole("button", { name: menu }), MAX_TABS), `"${menu}" menu can be reached with Tab`).toBe(true)
    await page.keyboard.press("Enter")
    expect(await tabTo(page, dropdown.getByRole("link", { name: /add new/i }), MAX_TABS), `"${menu} → Add New" can be reached with Tab`).toBe(true)
    await page.keyboard.press("Enter")
    await expect(page.getByRole("heading", { name: heading })).toBeVisible()
  }
})

test("A11Y-003 New Owner form can be completed with the keyboard", { tag: "@a11y" }, async ({ page, ownerForm, data }) => {
  const owner = ownerData()
  data.expectOwner(owner.lastName)
  await ownerForm.gotoNew()
  await ownerForm.firstName.focus()

  for (const [field, value] of [
    [ownerForm.firstName, owner.firstName],
    [ownerForm.lastName, owner.lastName],
    [ownerForm.address, owner.address],
    [ownerForm.city, owner.city],
    [ownerForm.telephone, owner.telephone]
  ] as const) {
    await expect(field, "focus follows the visual order").toBeFocused()
    await page.keyboard.type(value)
    await page.keyboard.press("Tab")
  }
  await expect(ownerForm.backButton).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(ownerForm.addOwnerButton).toBeFocused()
  await page.keyboard.press("Enter")

  await expect(page).toHaveURL("/owners")
  expect(await data.findOwnersByLastName(owner.lastName)).toHaveLength(1)
})

test("A11Y-004 Form fields have accessible names", { tag: "@a11y" }, async ({ page, ownersPage, petForm, visitForm, petTypesPage, specialtiesPage, data }) => {
  const owner = await data.owner()
  const pet = await data.pet(owner)
  const fields: { screen: string, field: string, locator: Locator, open: () => Promise<void> }[] = [
    { screen: "Owners", field: "last name search", locator: ownersPage.lastNameInput, open: () => ownersPage.goto() },
    { screen: "Add Pet", field: "Owner", locator: petForm.ownerName, open: async () => { await page.goto(`/owners/${owner.id}/pets/add`); await petForm.waitUntilLoaded() } },
    { screen: "Add Pet", field: "Birth Date", locator: petForm.birthDate, open: async () => {} },
    { screen: "New Visit", field: "Date", locator: visitForm.date, open: () => page.goto(`/pets/${pet.id}/visits/add`).then(() => {}) },
    { screen: "New Visit", field: "Description", locator: visitForm.description, open: async () => {} },
    { screen: "Pet Types", field: "Name (new)", locator: petTypesPage.newNameInput, open: async () => { await petTypesPage.goto(); await petTypesPage.addButton.click() } },
    { screen: "Specialties", field: "Name (new)", locator: specialtiesPage.newNameInput, open: async () => { await specialtiesPage.goto(); await specialtiesPage.addButton.click() } }
  ]

  const missing: string[] = []
  for (const { screen, field, locator, open } of fields) {
    await open()
    await expect(locator, `${screen} – ${field}`).toBeAttached()
    if (!(await hasAccessibleName(locator))) missing.push(`${screen} – ${field}`)
  }
  test.info().annotations.push({ type: "fields-without-name", description: missing.join("; ") || "none" })
  expect(missing).toEqual([])
})
