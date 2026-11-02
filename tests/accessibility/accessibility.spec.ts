import AxeBuilder from "@axe-core/playwright"
import type { Locator, Page, Response } from "@playwright/test"
import { expect, knownBug, test } from "../../fixtures"
import { ownerData } from "../../test-data/builders"

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]

// axe rules with a confirmed, reported violation. Any other rule fails the test normally.
const BUG_BY_RULE: Record<string, string> = {
  "link-name": "BUG-011",
  "label": "BUG-012",
  "definition-list": "BUG-014",
  "color-contrast": "BUG-016"
}

type ListName = "owners" | "vets" | "pettypes" | "specialties"

// The GET request each list page sends for its rows
const LIST_REQUEST: Record<ListName, RegExp> = {
  owners: /\/api\/owners(\?.*)?$/,
  vets: /\/api\/vets$/,
  pettypes: /\/api\/pettypes$/,
  specialties: /\/api\/specialties$/
}

const STATIC_PAGES: { path: string, heading: string, list?: ListName, knownRules: string[] }[] = [
  { path: "/", heading: "Welcome to Petclinic", knownRules: ["link-name"] },
  { path: "/owners", heading: "Owners", list: "owners", knownRules: ["link-name", "label", "color-contrast"] },
  { path: "/owners/add", heading: "New Owner", knownRules: ["link-name"] },
  { path: "/vets", heading: "Veterinarians", list: "vets", knownRules: ["link-name"] },
  { path: "/vets/add", heading: "New Veterinarian", knownRules: ["link-name"] },
  { path: "/pettypes", heading: "Pet Types", list: "pettypes", knownRules: ["link-name", "label"] },
  { path: "/specialties", heading: "Specialties", list: "specialties", knownRules: ["link-name", "label"] }
]

const NAME_CHECK_TIMEOUT_MS = 1000

type Violation = { rule: string, screen?: string, summary: string, bug?: string }
type KnownViolation = { rule: string, screen?: string }

// Waits until the table shows every item of the page's own list response. A separate API
// call could see different data if another test or session changes records in between.
async function expectAllRowsShown(rows: Locator, listResponse: Response): Promise<void> {
  const items = await listResponse.json() as unknown[]
  await expect(rows).toHaveCount(items.length)
}

// Callers wait for the page's content first; the loading spinner (BUG-015) and half-rendered
// lists would otherwise change the result from run to run. Each violation is linked to its
// bug if the rule is a known one for this screen.
async function scan(page: Page, knownRules: string[], screen?: string): Promise<Violation[]> {
  await expect(page.getByRole("progressbar")).toHaveCount(0)
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  return results.violations.map(violation => ({
    rule: violation.id,
    screen,
    summary: `${screen ? `${screen}: ` : ""}${violation.id} (${violation.impact}, ${violation.nodes.length} node(s))`,
    bug: knownRules.includes(violation.id) ? BUG_BY_RULE[violation.id] : undefined
  }))
}

// Fails normally for violations without a known bug, and for known ones that no longer occur
// (a bug fixed on one screen would otherwise stay hidden behind the others). Then checks the
// known ones as known bugs.
async function expectOnlyKnownViolations(found: Violation[], known: KnownViolation[]): Promise<void> {
  const label = (item: KnownViolation) => `${item.screen ? `${item.screen}: ` : ""}${item.rule} (${BUG_BY_RULE[item.rule]})`
  test.info().annotations.push({ type: "axe-violations", description: found.map(violation => violation.summary).join("; ") || "none" })
  expect(found.filter(violation => !violation.bug).map(violation => violation.summary), "violations not linked to a known bug").toEqual([])
  const gone = known.filter(item => !found.some(violation => violation.rule === item.rule && violation.screen === item.screen))
  expect(gone.map(label), "known violations that no longer occur: update docs/BUG-REPORTS.md and knownRules").toEqual([])

  await knownBug([...new Set(known.map(item => BUG_BY_RULE[item.rule]))], async () => {
    expect(found.map(violation => violation.summary)).toEqual([])
  })
}

// Uses Playwright's own accessible-name computation (the same one getByRole relies on)
async function hasAccessibleName(field: Locator): Promise<boolean> {
  return expect(field).toHaveAccessibleName(/\S/, { timeout: NAME_CHECK_TIMEOUT_MS }).then(() => true, () => false)
}

test.describe("A11Y-001 Automated axe scan", { tag: "@a11y" }, () => {
  for (const { path, heading, list, knownRules } of STATIC_PAGES) {
    test(`A11Y-001 axe scan: ${path}`, async ({ page, ownersPage, vetsPage, petTypesPage, specialtiesPage }) => {
      const rows: Record<ListName, Locator> = { owners: ownersPage.ownerRows, vets: vetsPage.rows, pettypes: petTypesPage.rows, specialties: specialtiesPage.rows }
      const listResponse = list && page.waitForResponse(response => response.request().method() === "GET" && LIST_REQUEST[list].test(response.url()))
      await page.goto(path)
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible()
      if (list && listResponse) await expectAllRowsShown(rows[list], await listResponse)

      await expectOnlyKnownViolations(await scan(page, knownRules), knownRules.map(rule => ({ rule })))
    })
  }

  test("A11Y-001 axe scan: owner details, Add Pet and New Visit", async ({ page, ownerDetails, petForm, visitForm, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const screens = [
      { name: "owner details", knownRules: ["link-name", "definition-list"], open: async () => { await ownerDetails.goto(owner.id); await expect(ownerDetails.pet(pet.name)).toBeVisible() } },
      { name: "Add Pet", knownRules: ["link-name", "label"], open: async () => { await page.goto(`/owners/${owner.id}/pets/add`); await petForm.waitUntilLoaded() } },
      { name: "New Visit", knownRules: ["link-name", "label"], open: async () => { await page.goto(`/pets/${pet.id}/visits/add`); await visitForm.waitUntilLoaded() } }
    ]

    const found: Violation[] = []
    for (const screen of screens) {
      await screen.open()
      found.push(...await scan(page, screen.knownRules, screen.name))
    }
    await expectOnlyKnownViolations(found, screens.flatMap(screen => screen.knownRules.map(rule => ({ rule, screen: screen.name }))))
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
  const notReachable: string[] = []
  for (const { menu, heading } of [
    { menu: "Owners", heading: "New Owner" },
    { menu: "Veterinarians", heading: "New Veterinarian" }
  ] as const) {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "Welcome to Petclinic" })).toBeVisible()
    const dropdown = navBar.dropdown(menu)

    if (!(await tabTo(page, dropdown.getByRole("button", { name: menu }), MAX_TABS))) {
      notReachable.push(menu)
      continue
    }
    await page.keyboard.press("Enter")
    expect(await tabTo(page, dropdown.getByRole("link", { name: /add new/i }), MAX_TABS), `"${menu} → Add New" can be reached with Tab`).toBe(true)
    await page.keyboard.press("Enter")
    await expect(page.getByRole("heading", { name: heading })).toBeVisible()
  }

  await knownBug("BUG-013", async () => {
    expect(notReachable, "menus that cannot be reached with Tab").toEqual([])
  })
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
  // Every field above is listed in BUG-012, so a field that gained a name means a partial fix
  const named = fields.map(({ screen, field }) => `${screen} – ${field}`).filter(name => !missing.includes(name))
  expect(named, "fields that now have a name: update docs/BUG-REPORTS.md (BUG-012) and this list").toEqual([])
  await knownBug("BUG-012", async () => {
    expect(missing).toEqual([])
  })
})

test("A11Y-007 Loading indicator has an accessible name", { tag: "@a11y" }, async ({ page }) => {
  // Holds this browser's own pet type list request so the spinner stays on screen
  let release: () => void = () => {}
  const held = new Promise<void>(resolve => { release = resolve })
  await page.route(LIST_REQUEST.pettypes, async route => {
    await held
    // The page may already be closing when the request is released (e.g. after a failure)
    await route.continue().catch(() => {})
  })

  try {
    await page.goto("/pettypes")
    const spinner = page.getByRole("progressbar")
    await expect(spinner).toBeVisible()
    // Read outside the known-bug check: if the spinner disappears, this fails normally
    // instead of counting as "bug still present"
    const entry = await spinner.ariaSnapshot()
    await knownBug("BUG-015", async () => {
      expect(entry, "spinner in the accessibility tree").toMatch(/^- progressbar "[^"]+"/)
    })
  } finally {
    release()
  }
})
