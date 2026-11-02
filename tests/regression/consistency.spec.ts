import { expect, fullName, test } from "../../fixtures"
import { ownerData, PET_BIRTH_DATE, petName, unique, uniqueName, VISIT_DATE } from "../../test-data/builders"

test("REG-001 Renamed pet type appears everywhere", { tag: "@regression" }, async ({ page, petTypesPage, ownerDetails, petForm, data }) => {
  const petType = await data.petType()
  const owner = await data.owner()
  const pet = await data.petOfType(owner, petType)
  const renamed = uniqueName("Renamed")
  await petTypesPage.goto()

  await petTypesPage.rename(petType.name, renamed)
  await expect(petTypesPage.nameField(renamed)).toHaveValue(renamed)

  await ownerDetails.goto(owner.id)
  await expect(ownerDetails.petDetail(pet.name, "Type")).toHaveText(renamed)
  await ownerDetails.clickPetButton(pet.name, "Edit Pet")
  await expect(petForm.name).toHaveValue(pet.name)
  await expect(petForm.type).toHaveValue(renamed)
  await expect(petForm.type.getByRole("option", { name: petType.name, exact: true })).toHaveCount(0)
  await page.goto(`/owners/${owner.id}/pets/add`)
  await petForm.waitUntilLoaded()
  await expect(petForm.type.getByRole("option", { name: renamed, exact: true })).toHaveCount(1)
  await expect(petForm.type.getByRole("option", { name: petType.name, exact: true })).toHaveCount(0)
})

test("REG-002 New specialty is offered in the vet forms", { tag: "@regression" }, async ({ page, vetForm, vetsPage, data }) => {
  const specialty = await data.specialty()
  const vet = await data.vet()

  await vetForm.gotoNew()
  await expect(vetForm.newSpecialtySelect.getByRole("option", { name: specialty.name, exact: true })).toHaveCount(1)

  await vetsPage.goto()
  await vetsPage.clickRowButton(fullName(vet), "Edit Vet")
  await expect(vetForm.firstName).toHaveValue(vet.firstName)
  await expect(page.locator(`input[type='checkbox'][id='${specialty.name}']`)).toHaveCount(1)
})

test("REG-003 Renamed specialty appears in the vet list", { tag: "@regression" }, async ({ specialtiesPage, vetsPage, data }) => {
  const specialty = await data.specialty()
  const vet = await data.vet([specialty])
  const renamed = uniqueName("Renamed")
  await specialtiesPage.goto()

  await specialtiesPage.rename(specialty.name, renamed)
  await expect(specialtiesPage.nameField(renamed)).toHaveValue(renamed)

  await vetsPage.goto()
  await expect(vetsPage.specialtiesCell(fullName(vet))).toHaveText(renamed)
})

test("REG-004 Edited owner appears in list and search", { tag: "@regression" }, async ({ ownerDetails, ownerForm, ownersPage, data }) => {
  const owner = await data.owner()
  const newLastName = uniqueName("Edited")
  await ownerDetails.goto(owner.id)
  await ownerDetails.editOwnerButton.click()
  await expect(ownerForm.lastName).toHaveValue(owner.lastName)

  await ownerForm.fill({ lastName: newLastName, city: "Editville" })
  await ownerForm.updateOwnerButton.click()
  await expect(ownerDetails.field("City")).toHaveText("Editville")

  await ownersPage.goto()
  await ownersPage.search(newLastName)
  await expect(ownersPage.ownerRow(`${owner.firstName} ${newLastName}`)).toContainText("Editville")
  await ownersPage.search(owner.lastName)
  await expect(ownersPage.noResultsMessage(owner.lastName)).toBeVisible()
})

test("REG-005 End-to-end clinic workflow", { tag: "@smoke" }, async ({ page, ownerForm, ownersPage, ownerDetails, petForm, visitForm, data }) => {
  const owner = ownerData()
  const pet = petName()
  const description = `Checkup ${unique()}`
  const editedDescription = `Edited ${unique()}`

  data.expectOwner(owner.lastName)
  await ownerForm.gotoNew()
  await ownerForm.fill(owner)
  await ownerForm.addOwnerButton.click()
  await expect(page).toHaveURL("/owners")
  const [created] = await data.findOwnersByLastName(owner.lastName)
  await ownersPage.search(owner.lastName)
  await ownersPage.openOwner(fullName(owner))
  await expect(ownerDetails.field("Name")).toHaveText(fullName(owner))

  await ownerDetails.addNewPetButton.click()
  await petForm.fill({ name: pet, birthDate: PET_BIRTH_DATE.ui, type: "dog" })
  await petForm.savePetButton.click()
  await expect(ownerDetails.petDetail(pet, "Name")).toHaveText(pet)
  ;(await data.api.getOwner(created.id)).pets.forEach(item => data.track("pets", item.id))

  await ownerDetails.clickPetButton(pet, "Add Visit")
  await visitForm.fill({ date: VISIT_DATE.ui, description })
  await visitForm.submit(visitForm.addVisitButton)
  await expect(ownerDetails.visitRow(pet, description)).toBeVisible()

  await ownerDetails.clickVisitButton(pet, description, "Edit Visit")
  await expect(visitForm.description).toHaveValue(description)
  await visitForm.fill({ description: editedDescription })
  await visitForm.submit(visitForm.updateVisitButton)
  await expect(ownerDetails.visitRow(pet, editedDescription)).toBeVisible()

  await ownerDetails.clickVisitButton(pet, editedDescription, "Delete Visit")
  await expect(ownerDetails.pet(pet).getByText(editedDescription)).toBeHidden()

  await ownerDetails.clickPetButton(pet, "Delete Pet")
  await expect(ownerDetails.allPets()).toHaveCount(0)
  await expect.poll(async () => (await data.api.getOwner(created.id)).pets).toHaveLength(0)
})

test("REG-006 Data survives a full page reload", { tag: "@regression" }, async ({ page, petTypesPage, data }) => {
  const petType = await data.petType()
  await petTypesPage.goto()
  await expect(petTypesPage.nameField(petType.name)).toHaveValue(petType.name)

  const seed = page.waitForResponse(res => res.url().endsWith("/api/seed"))
  await page.reload()

  expect((await seed).status()).toBe(201)
  await expect(petTypesPage.nameField(petType.name)).toHaveValue(petType.name)
})
