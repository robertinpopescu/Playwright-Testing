import { expect, test } from "../../fixtures"

// Runs only in the tablet and mobile projects (see playwright.config.ts)

const PAGES = [
  { path: "/owners", heading: "Owners" },
  { path: "/owners/add", heading: "New Owner" },
  { path: "/vets", heading: "Veterinarians" },
  { path: "/vets/add", heading: "New Veterinarian" },
  { path: "/pettypes", heading: "Pet Types" },
  { path: "/specialties", heading: "Specialties" }
]

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

test("RSP-002 No horizontal page scroll on tablet and mobile", { tag: "@responsive" }, async ({ page, data }) => {
  const owner = await data.owner()
  const pet = await data.pet(owner)
  const pages = [
    ...PAGES,
    { path: `/owners/${owner.id}`, heading: "Owner Information" },
    { path: `/owners/${owner.id}/pets/add`, heading: "Add Pet" },
    { path: `/pets/${pet.id}/visits/add`, heading: "New Visit" }
  ]

  const overflowing: string[] = []
  for (const { path, heading } of pages) {
    await page.goto(path)
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible()
    await page.waitForLoadState("networkidle")
    // Mobile browsers widen the layout viewport to fit wide content, so the page width is
    // compared with the device screen width, not with window.innerWidth
    const { pageWidth, screenWidth } = await page.evaluate(() => ({
      pageWidth: Math.max(document.documentElement.scrollWidth, window.innerWidth),
      screenWidth: window.screen.width
    }))
    if (pageWidth > screenWidth) overflowing.push(`${path.replace(/\d+/g, "{id}")}: ${pageWidth}px > ${screenWidth}px`)
  }

  test.info().annotations.push({ type: "overflow", description: overflowing.join("; ") || "none" })
  expect(overflowing).toEqual([])
})
