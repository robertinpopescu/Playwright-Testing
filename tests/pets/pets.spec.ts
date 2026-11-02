import { expect, fullName, knownBug, requestDuring, test } from "../../fixtures"
import { PET_BIRTH_DATE, petName } from "../../test-data/builders"

test.describe("Add pet", () => {
  test("PET-001 Add a pet to an owner", { tag: "@smoke" }, async ({ page, ownerDetails, petForm, data }) => {
    const owner = await data.owner()
    const name = petName()
    await ownerDetails.goto(owner.id)
    await ownerDetails.addNewPetButton.click()
    await petForm.fill({ name, type: "dog" })
    const birthDate = await petForm.pickBirthDateInCalendar(15)

    const response = page.waitForResponse(res => res.url().endsWith(`/owners/${owner.id}/pets`) && res.request().method() === "POST")
    await petForm.savePetButton.click()
    expect((await response).status()).toBe(201)
    ;(await data.api.getOwner(owner.id)).pets.forEach(pet => data.track("pets", pet.id))

    await expect(page).toHaveURL(`/owners/${owner.id}`)
    await expect(ownerDetails.petDetail(name, "Name")).toHaveText(name)
    await expect(ownerDetails.petDetail(name, "Birth Date")).toHaveText(birthDate)
    await expect(ownerDetails.petDetail(name, "Type")).toHaveText("dog")
  })

  test("PET-002 Add Pet form shows the owner", { tag: "@regression" }, async ({ ownerDetails, petForm, data }) => {
    const owner = await data.owner()
    await ownerDetails.goto(owner.id)

    await ownerDetails.addNewPetButton.click()

    await expect(petForm.addHeading).toBeVisible()
    await expect(petForm.ownerName).toHaveValue(fullName(owner))
    await expect(petForm.ownerName).not.toBeEditable()
  })

  test("PET-003 Type dropdown lists all pet types", { tag: "@regression" }, async ({ page, petForm, data, petclinic }) => {
    const owner = await data.owner()
    const petType = await data.petType()
    await page.goto(`/owners/${owner.id}/pets/add`)
    await petForm.waitUntilLoaded()

    const expected = (await petclinic.listPetTypes()).map(type => type.name)
    await expect(petForm.type.getByRole("option")).toHaveText(expected)
    expect(expected).toContain(petType.name)
  })

  test("PET-004 Required-field messages on Add Pet", { tag: "@negative" }, async ({ page, petForm, data }) => {
    const owner = await data.owner()
    await page.goto(`/owners/${owner.id}/pets/add`)
    await petForm.waitUntilLoaded()

    for (const field of [petForm.name, petForm.birthDate]) {
      await field.fill("x")
      await field.fill("")
      await field.blur()
    }

    await expect(petForm.message("Name is required")).toBeVisible()
    await expect(petForm.message("BirthDate is required")).toBeVisible()
  })

  test("PET-005 Save Pet on an empty form gives feedback", { tag: "@negative" }, async ({ page, petForm, data }) => {
    const owner = await data.owner()
    await page.goto(`/owners/${owner.id}/pets/add`)
    await petForm.waitUntilLoaded()

    await knownBug("BUG-005", async () => {
      // Correct: the button is disabled, or clicking it shows messages; never a request
      if (await petForm.savePetButton.isDisabled()) return
      const post = await requestDuring(page, request => request.method() === "POST" && request.url().includes("/pets"), () => petForm.savePetButton.click())
      expect(post, "no request for an empty form").toBeNull()
      await expect(page.getByText(/is required/).first()).toBeVisible()
    })
  })

  test("PET-006 Birth date entered by typing", { tag: "@regression" }, async ({ page, ownerDetails, petForm, data }) => {
    const owner = await data.owner()
    const name = petName()
    await ownerDetails.goto(owner.id)
    await ownerDetails.addNewPetButton.click()

    await petForm.fill({ name, birthDate: PET_BIRTH_DATE.ui, type: "dog" })
    await petForm.savePetButton.click()

    await expect(page).toHaveURL(`/owners/${owner.id}`)
    const saved = (await data.api.getOwner(owner.id)).pets
    saved.forEach(pet => data.track("pets", pet.id))
    expect(saved.find(pet => pet.name === name)?.birthDate).toBe(PET_BIRTH_DATE.api)
    await expect(ownerDetails.petDetail(name, "Birth Date")).toHaveText(PET_BIRTH_DATE.api)
  })

  test("PET-011 Back on Add Pet creates nothing", { tag: "@regression" }, async ({ page, ownerDetails, petForm, data }) => {
    const owner = await data.owner()
    await ownerDetails.goto(owner.id)
    await ownerDetails.addNewPetButton.click()
    await petForm.fill({ name: petName(), birthDate: PET_BIRTH_DATE.ui, type: "dog" })

    await petForm.backButton.click()

    await expect(page).toHaveURL(`/owners/${owner.id}`)
    expect((await data.api.getOwner(owner.id)).pets).toHaveLength(0)
  })
})

test.describe("Edit and delete pet", () => {
  test("PET-008 Edit a pet", { tag: "@regression" }, async ({ ownerDetails, petForm, data, petclinic }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const newName = petName()
    await ownerDetails.goto(owner.id)
    await ownerDetails.clickPetButton(pet.name, "Edit Pet")
    await expect(petForm.editHeading).toBeVisible()
    await expect(petForm.name).toHaveValue(pet.name)

    await petForm.fill({ name: newName, birthDate: "2019/06/01", type: "cat" })
    await petForm.updatePetButton.click()

    await expect(ownerDetails.petDetail(newName, "Birth Date")).toHaveText("2019-06-01")
    await expect(ownerDetails.petDetail(newName, "Type")).toHaveText("cat")
    expect(await petclinic.getPet(pet.id)).toMatchObject({ name: newName, birthDate: "2019-06-01", type: { name: "cat" } })
  })

  test("PET-009 Edit Pet form is pre-filled", { tag: "@regression" }, async ({ ownerDetails, petForm, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    await ownerDetails.goto(owner.id)

    await ownerDetails.clickPetButton(pet.name, "Edit Pet")

    await expect(petForm.ownerName).toHaveValue(fullName(owner))
    await expect(petForm.name).toHaveValue(pet.name)
    await expect(petForm.birthDate).toHaveValue(PET_BIRTH_DATE.ui)
    await expect(petForm.type).toHaveValue("dog")
  })

  test("PET-010 Back on Edit Pet returns to the owner", { tag: "@regression" }, async ({ page, ownerDetails, petForm, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    await ownerDetails.goto(owner.id)
    await ownerDetails.clickPetButton(pet.name, "Edit Pet")
    await expect(petForm.name).toHaveValue(pet.name)

    await petForm.backButton.click()

    await knownBug("BUG-001", async () => {
      await expect(page).toHaveURL(`/owners/${owner.id}`)
    })
  })

  test("PET-012 Delete a pet", { tag: "@regression" }, async ({ ownerDetails, data, petclinic }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    await ownerDetails.goto(owner.id)
    await expect(ownerDetails.pet(pet.name)).toBeVisible()

    await ownerDetails.clickPetButton(pet.name, "Delete Pet")

    await expect(ownerDetails.pet(pet.name)).toBeHidden()
    await expect.poll(() => petclinic.status("pets", pet.id)).toBe(404)
  })

  test("PET-013 Deleting a pet asks for confirmation", { tag: "@regression" }, async ({ page, ownerDetails, data, petclinic }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    await ownerDetails.goto(owner.id)
    await expect(ownerDetails.pet(pet.name)).toBeVisible()
    const dialogs: string[] = []
    page.on("dialog", dialog => { dialogs.push(dialog.message()); void dialog.dismiss() })

    await ownerDetails.clickPetButton(pet.name, "Delete Pet")

    await knownBug("BUG-004", async () => {
      await expect.poll(() => dialogs.length).toBe(1)
      await expect(ownerDetails.pet(pet.name)).toBeVisible()
      expect(await petclinic.status("pets", pet.id)).toBe(200)
    })
  })

  test("PET-014 Delete a pet that has visits", { tag: "@regression" }, async ({ ownerDetails, data, petclinic }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const visit = await data.visit(owner, pet)
    await ownerDetails.goto(owner.id)
    await expect(ownerDetails.visitRow(pet.name, visit.description)).toBeVisible()

    await ownerDetails.clickPetButton(pet.name, "Delete Pet")

    await expect(ownerDetails.pet(pet.name)).toBeHidden()
    await expect(ownerDetails.heading).toBeVisible()
    await expect.poll(() => petclinic.status("visits", visit.id)).toBe(404)
  })
})
