import { expect, fullName, knownBug, requestDuring, test } from "../../fixtures"
import { uniqueName } from "../../test-data/builders"

test.beforeEach(async ({ specialtiesPage }) => {
  await specialtiesPage.goto()
})

test("SPC-001 Specialty list", { tag: "@smoke" }, async ({ specialtiesPage, petclinic }) => {
  await expect(specialtiesPage.heading).toBeVisible()
  const expected = (await petclinic.listSpecialties()).map(specialty => specialty.name)

  await expect.poll(() => specialtiesPage.names()).toEqual(expected)
  for (const name of expected) {
    await expect(specialtiesPage.row(name).getByRole("button", { name: "Edit" })).toBeVisible()
    await expect(specialtiesPage.row(name).getByRole("button", { name: "Delete" })).toBeVisible()
  }
  await expect(specialtiesPage.homeButton).toBeVisible()
  await expect(specialtiesPage.addButton).toBeVisible()
})

test("SPC-002 Add a specialty", { tag: "@smoke" }, async ({ page, specialtiesPage, data }) => {
  const name = uniqueName("Spec")
  await specialtiesPage.addButton.click()
  await expect(specialtiesPage.newFormHeading).toBeVisible()

  await specialtiesPage.newNameInput.fill(name)
  const response = page.waitForResponse(res => res.url().endsWith("/api/specialties") && res.request().method() === "POST")
  await specialtiesPage.saveButton.click()
  const created = await response
  expect(created.status()).toBe(201)
  data.track("specialties", (await created.json()).id)

  await expect(specialtiesPage.nameField(name)).toHaveValue(name)
})

test("SPC-003 Empty specialty name is not saved", { tag: "@negative" }, async ({ page, specialtiesPage, petclinic, data }) => {
  const before = await petclinic.listSpecialties()
  await data.watch("specialties")
  await specialtiesPage.addButton.click()

  const post = await requestDuring(page, request => request.method() === "POST" && request.url().endsWith("/specialties"), () => specialtiesPage.saveButton.click())
  const response = post ? await post.response() : null

  await expect(specialtiesPage.message("Name is required")).toBeVisible()
  await expect.poll(() => specialtiesPage.names()).toEqual(before.map(specialty => specialty.name))
  expect(await petclinic.listSpecialties()).toEqual(before)
  // OBS-002: the form still sends the request, which the API rejects with 400
  test.info().annotations.push({ type: "observed", description: `POST sent: ${post !== null}; status: ${response?.status() ?? "-"}` })
})

test("SPC-004 Rename a specialty", { tag: "@regression" }, async ({ page, specialtiesPage, data, petclinic }) => {
  const specialty = await data.specialty()
  const newName = uniqueName("Renamed")
  await page.reload()

  await specialtiesPage.rename(specialty.name, newName)

  await expect(specialtiesPage.nameField(newName)).toHaveValue(newName)
  expect((await petclinic.listSpecialties()).find(item => item.id === specialty.id)?.name).toBe(newName)
})

test("SPC-005 Cancel on Edit Specialty keeps the name", { tag: "@regression" }, async ({ page, specialtiesPage, data, petclinic }) => {
  const specialty = await data.specialty()
  await page.reload()
  await specialtiesPage.openEdit(specialty.name)

  await specialtiesPage.editNameInput.fill(uniqueName("Changed"))
  await specialtiesPage.cancelButton.click()

  await expect(specialtiesPage.nameField(specialty.name)).toHaveValue(specialty.name)
  expect((await petclinic.listSpecialties()).find(item => item.id === specialty.id)?.name).toBe(specialty.name)
})

test("SPC-006 Delete a specialty", { tag: "@regression" }, async ({ page, specialtiesPage, data, petclinic }) => {
  const specialty = await data.specialty()
  await page.reload()

  await specialtiesPage.clickDelete(specialty.name)

  await expect(specialtiesPage.row(specialty.name)).toHaveCount(0)
  await expect.poll(async () => (await petclinic.listSpecialties()).some(item => item.id === specialty.id)).toBe(false)
})

test("SPC-007 Deleting a specialty asks for confirmation", { tag: "@regression" }, async ({ page, specialtiesPage, data, petclinic }) => {
  const specialty = await data.specialty()
  await page.reload()
  const dialogs: string[] = []
  page.on("dialog", dialog => { dialogs.push(dialog.message()); void dialog.dismiss() })

  await specialtiesPage.clickDelete(specialty.name)

  await knownBug("BUG-004", async () => {
    await expect.poll(() => dialogs.length).toBe(1)
    await expect(specialtiesPage.row(specialty.name)).toHaveCount(1)
    expect((await petclinic.listSpecialties()).some(item => item.id === specialty.id)).toBe(true)
  })
})

test("SPC-008 Delete a specialty that a vet has", { tag: "@regression" }, async ({ page, specialtiesPage, vetsPage, data, petclinic }) => {
  const specialty = await data.specialty()
  const vet = await data.vet([specialty])
  await page.reload()

  const response = page.waitForResponse(res => res.url().endsWith(`/specialties/${specialty.id}`) && res.request().method() === "DELETE")
  await specialtiesPage.clickDelete(specialty.name)
  expect((await response).status()).toBe(204)

  // Observed in Phase 4: the vet stays and loses only this specialty; UI and API must agree
  await vetsPage.goto()
  await expect(vetsPage.row(fullName(vet))).toHaveCount(1)
  await expect(vetsPage.specialtiesCell(fullName(vet))).not.toContainText(specialty.name)
  expect((await petclinic.getVet(vet.id)).specialties).toEqual([])
})
