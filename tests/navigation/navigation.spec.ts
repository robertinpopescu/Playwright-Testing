import { expect, knownBug, test } from "../../fixtures"
import { unique } from "../../test-data/builders"

const ROUTES = [
  { path: "/owners", heading: "Owners" },
  { path: "/owners/add", heading: "New Owner" },
  { path: "/vets", heading: "Veterinarians" },
  { path: "/vets/add", heading: "New Veterinarian" },
  { path: "/pettypes", heading: "Pet Types" },
  { path: "/specialties", heading: "Specialties" }
]

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("NAV-002 Top-level navbar links open the correct pages", { tag: "@smoke" }, async ({ page, navBar }) => {
  await navBar.openPetTypes()
  await expect(page).toHaveURL("/pettypes")
  await expect(page.getByRole("heading", { name: "Pet Types", level: 2 })).toBeVisible()

  await navBar.openSpecialties()
  await expect(page).toHaveURL("/specialties")
  await expect(page.getByRole("heading", { name: "Specialties", level: 2 })).toBeVisible()

  await navBar.openHome()
  await expect(page).toHaveURL("/welcome")
  await expect(page.getByRole("heading", { name: "Welcome to Petclinic", level: 1 })).toBeVisible()
})

test("NAV-003 Owners dropdown opens Search and Add New", { tag: "@smoke" }, async ({ page, navBar }) => {
  await navBar.openOwnersSearch()
  await expect(page).toHaveURL("/owners")
  await expect(page.getByRole("heading", { name: "Owners", level: 2 })).toBeVisible()

  await navBar.openOwnersAddNew()
  await expect(page).toHaveURL("/owners/add")
  await expect(page.getByRole("heading", { name: "New Owner", level: 2 })).toBeVisible()
})

test("NAV-004 Veterinarians dropdown opens All and Add New", { tag: "@smoke" }, async ({ page, navBar }) => {
  await navBar.openVetsAll()
  await expect(page).toHaveURL("/vets")
  await expect(page.getByRole("heading", { name: "Veterinarians", level: 2 })).toBeVisible()

  await navBar.openVetsAddNew()
  await expect(page).toHaveURL("/vets/add")
  await expect(page.getByRole("heading", { name: "New Veterinarian", level: 2 })).toBeVisible()
})

test("NAV-005 Every route opens directly by URL", { tag: "@regression" }, async ({ page, navBar }) => {
  for (const route of ROUTES) {
    await page.goto(route.path)
    await expect(page.getByRole("heading", { name: route.heading, exact: true, level: 2 }), route.path).toBeVisible()
    await expect(navBar.nav).toBeVisible()
  }
})

test("NAV-006 Unknown URL shows the 404 page", { tag: "@negative" }, async ({ page, navBar }) => {
  await page.goto(`/qa-no-such-page-${unique()}`)

  await expect(page.getByText("Oops! Page not found")).toBeVisible()
  await expect(page.getByText("Not Found - 404 error")).toBeVisible()
  await navBar.openPetTypes()
  await expect(page.getByRole("heading", { name: "Pet Types", level: 2 })).toBeVisible()
})

test("NAV-007 Browser back and forward keep the right page", { tag: "@regression" }, async ({ page, navBar }) => {
  await navBar.openOwnersSearch()
  await expect(page.getByRole("heading", { name: "Owners", level: 2 })).toBeVisible()
  await navBar.openPetTypes()
  await expect(page.getByRole("heading", { name: "Pet Types", level: 2 })).toBeVisible()

  await page.goBack()
  await expect(page.getByRole("heading", { name: "Owners", level: 2 })).toBeVisible()
  await page.goForward()
  await expect(page.getByRole("heading", { name: "Pet Types", level: 2 })).toBeVisible()
})

test("NAV-008 Each page has a descriptive title", { tag: "@a11y" }, async ({ page }) => {
  const titles = new Set<string>()
  for (const route of ROUTES) {
    await page.goto(route.path)
    await expect(page.getByRole("heading", { name: route.heading, exact: true, level: 2 })).toBeVisible()
    titles.add(await page.title())
  }

  await knownBug("BUG-007", async () => {
    expect(titles.size, `distinct titles: ${[...titles].join(" | ")}`).toBe(ROUTES.length)
  })
})
