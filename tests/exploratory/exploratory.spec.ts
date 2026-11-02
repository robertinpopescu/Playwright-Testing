import { expect, fullName, test } from "../../fixtures"
import { ownerData, petName } from "../../test-data/builders"

// Exploratory cases: no requirement defines the expected result. Each test records what
// the application did (annotation "observed") and asserts only what must always hold.

function observed(description: string): void {
  test.info().annotations.push({ type: "observed", description })
}

// Local calendar date (yyyy-MM-dd); toISOString() would use UTC and shift the day near midnight
function isoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function uiDate(iso: string): string {
  return iso.replaceAll("-", "/")
}

test("OWN-006 Search with surrounding spaces", { tag: "@exploratory" }, async ({ ownersPage, data }) => {
  const owner = await data.owner()
  await ownersPage.goto()

  const response = await ownersPage.search(` ${owner.lastName} `)

  const found = await ownersPage.ownerRow(fullName(owner)).count()
  observed(`API status ${response.status()}; owner found: ${found > 0}`)
})

test("OWN-014 Telephone with very few digits", { tag: "@exploratory" }, async ({ page, ownerForm, data }) => {
  const owner = ownerData({ telephone: "123" })
  data.expectOwner(owner.lastName)
  await ownerForm.gotoNew()
  await ownerForm.fill(owner)

  const enabled = await ownerForm.addOwnerButton.isEnabled()
  if (enabled) {
    await ownerForm.addOwnerButton.click()
    await expect(page).toHaveURL("/owners")
  }
  const saved = await data.findOwnersByLastName(owner.lastName)
  observed(`Add Owner enabled: ${enabled}; saved: ${saved.length > 0}`)
})

test("PET-007 Birth date in the future", { tag: "@exploratory" }, async ({ page, petForm, data }) => {
  const owner = await data.owner()
  const tomorrow = isoDate(addDays(new Date(), 1))
  const name = petName()
  await page.goto(`/owners/${owner.id}/pets/add`)

  await petForm.fill({ name, birthDate: uiDate(tomorrow), type: "dog" })
  const response = page.waitForResponse(res => res.url().endsWith(`/owners/${owner.id}/pets`) && res.request().method() === "POST", { timeout: 5000 }).catch(() => null)
  await petForm.savePetButton.click()
  const post = await response
  const pets = (await data.api.getOwner(owner.id)).pets
  pets.forEach(pet => data.track("pets", pet.id))

  observed(`date ${tomorrow}: POST ${post ? post.status() : "not sent"}; saved birth date: ${pets.find(pet => pet.name === name)?.birthDate ?? "not saved"}`)
})

test("VIS-011 Visit date edge values", { tag: "@exploratory" }, async ({ page, visitForm, data }) => {
  const owner = await data.owner()
  const pet = await data.pet(owner)
  const today = isoDate(new Date())
  const tomorrow = isoDate(addDays(new Date(), 1))
  const results: string[] = []

  for (const date of [today, tomorrow, "2024-02-29", "2019-01-01"]) {
    const description = `Edge ${date}`
    await page.goto(`/pets/${pet.id}/visits/add`)
    await expect(visitForm.petTable).toContainText(pet.name)
    await visitForm.fill({ date: uiDate(date), description })
    const response = page.waitForResponse(res => res.url().endsWith(`/pets/${pet.id}/visits`) && res.request().method() === "POST", { timeout: 5000 }).catch(() => null)
    await visitForm.submit(visitForm.addVisitButton)
    const post = await response
    const saved = (await data.api.getPet(pet.id)).visits
    saved.forEach(visit => data.track("visits", visit.id))
    const visit = saved.find(item => item.description === description)
    results.push(`${date}: POST ${post ? post.status() : "not sent"}, saved as ${visit?.date ?? "-"}`)
    if (visit) expect(visit.date, "an accepted date is stored unchanged").toBe(date)
  }

  observed(`${results.join("; ")} (pet born 2020-01-15)`)
})
