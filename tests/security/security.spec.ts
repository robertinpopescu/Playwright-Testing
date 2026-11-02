import type { Page } from "@playwright/test"
import { API_BASE_URL } from "../../fixtures/api"
import { expect, fullName, knownBug, test } from "../../fixtures"
import { uniqueName } from "../../test-data/builders"
import { XSS_IMG, XSS_SCRIPT, XSS_TAG } from "../../test-data/naming"

const API_HOST = new URL(API_BASE_URL).host

// Collects JavaScript dialogs, which a successful XSS payload would open
function collectDialogs(page: Page): string[] {
  const dialogs: string[] = []
  page.on("dialog", dialog => { dialogs.push(dialog.message()); void dialog.dismiss() })
  return dialogs
}

async function expectNoInjectedElements(page: Page): Promise<void> {
  await expect(page.locator("img[src='x']")).toHaveCount(0)
  await expect(page.locator("b", { hasText: /^x$/ })).toHaveCount(0)
  await expect(page.locator("script", { hasText: "alert(1)" })).toHaveCount(0)
}

test("SEC-001 Script-like input in owner fields is shown as text", { tag: "@security" }, async ({ page, ownersPage, ownerDetails, data }) => {
  // Names accept letters only (BUG-010), so the payloads go into the free-text fields
  const owner = await data.owner({ address: XSS_SCRIPT, city: XSS_IMG })
  const dialogs = collectDialogs(page)

  await ownersPage.goto()
  await ownersPage.search(owner.lastName)
  await expect(ownersPage.ownerRow(fullName(owner))).toContainText(XSS_SCRIPT)
  await expectNoInjectedElements(page)

  await ownerDetails.goto(owner.id)
  await expect(ownerDetails.field("Address")).toHaveText(XSS_SCRIPT)
  await expect(ownerDetails.field("City")).toHaveText(XSS_IMG)
  await expectNoInjectedElements(page)

  await ownersPage.goto()
  await ownersPage.search(XSS_TAG)
  await expect(ownersPage.noResultsMessage(XSS_TAG)).toBeVisible()
  await expectNoInjectedElements(page)
  expect(dialogs).toEqual([])
})

test("SEC-002 Script-like input in names of other entities", { tag: "@security" }, async ({ page, petTypesPage, specialtiesPage, ownerDetails, data }) => {
  const petType = await data.petType(`${uniqueName("Xss")}${XSS_IMG}`)
  const specialty = await data.specialty(`${uniqueName("Xss")}${XSS_IMG}`)
  const owner = await data.owner()
  const pet = await data.petOfType(owner, petType)
  await data.visit(owner, pet, { description: `Qa ${XSS_SCRIPT}` })
  const dialogs = collectDialogs(page)

  await petTypesPage.goto()
  await expect(petTypesPage.nameField(petType.name)).toHaveValue(petType.name)
  await expectNoInjectedElements(page)
  await specialtiesPage.goto()
  await expect(specialtiesPage.nameField(specialty.name)).toHaveValue(specialty.name)
  await expectNoInjectedElements(page)
  await ownerDetails.goto(owner.id)
  await expect(ownerDetails.petDetail(pet.name, "Type")).toHaveText(petType.name)
  await expect(ownerDetails.pet(pet.name)).toContainText(XSS_SCRIPT)
  await expectNoInjectedElements(page)
  expect(dialogs).toEqual([])
})

test("SEC-003 Access token is sent only to the API", { tag: "@security" }, async ({ page, navBar }) => {
  // Header reads are async; they are collected and awaited before asserting, so no request
  // can be checked after the assertion has already run
  const checks: Promise<{ url: string, host: string, hasToken: boolean }>[] = []
  page.on("request", request => {
    checks.push(request.allHeaders().then(
      headers => ({ url: request.url(), host: new URL(request.url()).host, hasToken: "authorization" in headers }),
      () => ({ url: request.url(), host: new URL(request.url()).host, hasToken: false })
    ))
  })

  await page.goto("/")
  await navBar.openOwnersSearch()
  await expect(page.getByRole("heading", { name: "Owners", level: 2 })).toBeVisible()
  await navBar.openVetsAll()
  await expect(page.getByRole("heading", { name: "Veterinarians", level: 2 })).toBeVisible()
  await navBar.openPetTypes()
  await expect(page.getByRole("heading", { name: "Pet Types", level: 2 })).toBeVisible()
  await navBar.openSpecialties()
  await expect(page.getByRole("heading", { name: "Specialties", level: 2 })).toBeVisible()
  await page.waitForLoadState("networkidle")

  const requests = await Promise.all(checks)
  // Positive control: the app's own API calls carry the token, so the check can see it
  expect(requests.filter(request => request.host === API_HOST && request.hasToken).length, "API requests with a token").toBeGreaterThan(0)
  expect(requests.filter(request => request.host !== API_HOST && request.hasToken).map(request => request.url)).toEqual([])
})

test("SEC-004 API errors do not leak internal details", { tag: ["@security", "@api"] }, async ({ api, data }) => {
  const owner = await data.owner()
  const pet = await data.pet(owner)
  await data.watch("pettypes")
  const errors = [
    await api.get("owners/999999999"),
    await api.post(`owners/${owner.id}/pets/${pet.id}/visits`, { data: { date: "Invalid date", description: "x" } }),
    await api.post("owners", { data: "{not json", headers: { "Content-Type": "application/json" } }),
    await api.post("pettypes", { data: {} })
  ]
  for (const response of errors) expect(response.status(), response.url()).toBeGreaterThanOrEqual(400)
  const bodies = await Promise.all(errors.map(async response => ({ label: `${response.status()} ${response.url()}`, body: await response.text() })))

  await knownBug("BUG-008", async () => {
    for (const { label, body } of bodies) {
      expect(body, label).not.toMatch(/org\.springframework|Exception|\.java\b|\bat [\w$]+\.[\w$]+\(|SELECT |INSERT /)
    }
  })
})
