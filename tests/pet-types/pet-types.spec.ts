import { expect, knownBug, requestDuring, test } from "../../fixtures"
import { uniqueName } from "../../test-data/builders"

function observed(description: string): void {
  test.info().annotations.push({ type: "observed", description })
}

test.beforeEach(async ({ petTypesPage }) => {
  await petTypesPage.goto()
})

test("PTY-001 Pet type list", { tag: "@smoke" }, async ({ petTypesPage, petclinic }) => {
  await expect(petTypesPage.heading).toBeVisible()
  const expected = (await petclinic.listPetTypes()).map(type => type.name)

  await expect.poll(() => petTypesPage.names()).toEqual(expected)
  for (const name of expected) {
    await expect(petTypesPage.row(name).getByRole("button", { name: "Edit" })).toBeVisible()
    await expect(petTypesPage.row(name).getByRole("button", { name: "Delete" })).toBeVisible()
  }
  await expect(petTypesPage.homeButton).toBeVisible()
  await expect(petTypesPage.addButton).toBeVisible()
})

test("PTY-002 Add a pet type", { tag: "@smoke" }, async ({ page, petTypesPage, data }) => {
  const name = uniqueName("Type")
  await petTypesPage.addButton.click()
  await expect(petTypesPage.newFormHeading).toBeVisible()

  await petTypesPage.newNameInput.fill(name)
  const response = page.waitForResponse(res => res.url().endsWith("/api/pettypes") && res.request().method() === "POST")
  await petTypesPage.saveButton.click()
  const created = await response
  expect(created.status()).toBe(201)
  data.track("pettypes", (await created.json()).id)

  await expect(petTypesPage.nameField(name)).toHaveValue(name)
})

test("PTY-003 Pet type name is required on Add", { tag: "@negative" }, async ({ page, petTypesPage, petclinic, data }) => {
  const before = await petclinic.listPetTypes()
  await data.watch("pettypes")
  await petTypesPage.addButton.click()

  await petTypesPage.newNameInput.fill("x")
  await petTypesPage.newNameInput.fill("")
  await petTypesPage.newNameInput.blur()
  await expect(petTypesPage.message("Name is required")).toBeVisible()
  const post = await requestDuring(page, request => request.method() === "POST" && request.url().endsWith("/pettypes"), () => petTypesPage.saveButton.click())

  test.info().annotations.push({ type: "observed", description: `POST sent: ${post !== null}` })
  await expect.poll(() => petTypesPage.names()).toEqual(before.map(type => type.name))
  expect(await petclinic.listPetTypes()).toEqual(before)
})

test("PTY-005 Cancel on Edit Pet Type keeps the name", { tag: "@regression" }, async ({ page, petTypesPage, data, petclinic }) => {
  const petType = await data.petType()
  await page.reload()
  await petTypesPage.openEdit(petType.name)

  await petTypesPage.editNameInput.fill(uniqueName("Changed"))
  await petTypesPage.cancelButton.click()

  await expect(petTypesPage.nameField(petType.name)).toHaveValue(petType.name)
  expect((await petclinic.listPetTypes()).find(type => type.id === petType.id)?.name).toBe(petType.name)
})

test("PTY-006 Edit Pet Type with an empty name", { tag: "@exploratory" }, async ({ page, petTypesPage, data, petclinic }) => {
  const petType = await data.petType()
  await page.reload()
  await petTypesPage.openEdit(petType.name)

  await petTypesPage.editNameInput.fill("")
  const messageShown = await petTypesPage.message("Name is required").isVisible()
  const response = page.waitForResponse(res => res.url().includes(`/pettypes/${petType.id}`) && res.request().method() === "PUT", { timeout: 5000 }).catch(() => null)
  await petTypesPage.updateButton.click()
  const put = await response
  const saved = (await petclinic.listPetTypes()).find(type => type.id === petType.id)

  observed(`message shown: ${messageShown}; PUT sent: ${put ? put.status() : "no"}; saved name: "${saved?.name}"`)
  expect(saved, "the pet type still exists").toBeDefined()
})

test("PTY-007 Delete a pet type after confirming", { tag: "@regression" }, async ({ page, petTypesPage, data }) => {
  const petType = await data.petType()
  await page.reload()
  let dialogMessage = ""
  page.once("dialog", dialog => { dialogMessage = dialog.message(); void dialog.accept() })

  const response = page.waitForResponse(res => res.url().endsWith(`/pettypes/${petType.id}`) && res.request().method() === "DELETE")
  await petTypesPage.clickDelete(petType.name)

  expect((await response).status()).toBe(204)
  expect(dialogMessage).toBe("Delete the pet type?")
  await expect(petTypesPage.row(petType.name)).toHaveCount(0)
})

test("PTY-008 Cancel the delete confirmation", { tag: "@regression" }, async ({ page, petTypesPage, data, petclinic }) => {
  const petType = await data.petType()
  await page.reload()
  page.once("dialog", dialog => void dialog.dismiss())

  await petTypesPage.clickDelete(petType.name)

  await expect(petTypesPage.nameField(petType.name)).toHaveValue(petType.name)
  expect((await petclinic.listPetTypes()).map(type => type.id)).toContain(petType.id)
})

test("PTY-009 Duplicate pet type name", { tag: "@exploratory" }, async ({ page, petTypesPage, data, petclinic }) => {
  const petType = await data.petType()
  await page.reload()

  const response = page.waitForResponse(res => res.url().endsWith("/api/pettypes") && res.request().method() === "POST")
  await petTypesPage.add(petType.name)
  const post = await response
  if (post.ok()) data.track("pettypes", (await post.json()).id)

  const duplicates = (await petclinic.listPetTypes()).filter(type => type.name === petType.name)
  observed(`POST status: ${post.status()}; records with this name: ${duplicates.length}`)
})

test("PTY-010 Delete a pet type that a pet uses", { tag: "@regression" }, async ({ page, petTypesPage, ownerDetails, data, petclinic }) => {
  const petType = await data.petType()
  const owner = await data.owner()
  const pet = await data.petOfType(owner, petType)
  const visit = await data.visit(owner, pet)
  await page.reload()
  page.once("dialog", dialog => void dialog.accept())

  const response = page.waitForResponse(res => res.url().endsWith(`/pettypes/${petType.id}`) && res.request().method() === "DELETE")
  await petTypesPage.clickDelete(petType.name)
  await response

  await ownerDetails.goto(owner.id)
  await expect(ownerDetails.heading).toBeVisible()
  // Correct behaviour: deleting a lookup value never silently deletes the pets and visits that use it
  await knownBug("BUG-009", async () => {
    expect(await petclinic.status("pets", pet.id), "the pet still exists").toBe(200)
    expect(await petclinic.status("visits", visit.id), "the visit still exists").toBe(200)
  })
})
