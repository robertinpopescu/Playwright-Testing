import { expect, fullName, knownBug, requestDuring, test } from "../../fixtures"
import { unique, VISIT_DATE } from "../../test-data/builders"

test.describe("Add visit", () => {
  test("VIS-001 Add a visit", { tag: "@smoke" }, async ({ page, ownerDetails, visitForm, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const description = `Checkup ${unique()}`
    await ownerDetails.goto(owner.id)
    await ownerDetails.clickPetButton(pet.name, "Add Visit")
    await expect(visitForm.newHeading).toBeVisible()

    await visitForm.fill({ date: VISIT_DATE.ui, description })
    const response = page.waitForResponse(res => res.url().endsWith(`/pets/${pet.id}/visits`) && res.request().method() === "POST")
    await visitForm.submit(visitForm.addVisitButton)
    expect((await response).status()).toBe(201)
    ;(await data.api.getPet(pet.id)).visits.forEach(visit => data.track("visits", visit.id))

    await expect(page).toHaveURL(`/owners/${owner.id}`)
    await expect(ownerDetails.visitRow(pet.name, description).getByRole("cell")).toHaveText([VISIT_DATE.api, description, /Edit Visit\s*Delete Visit/])
  })

  test("VIS-002 New Visit page shows the pet", { tag: "@regression" }, async ({ ownerDetails, visitForm, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    await ownerDetails.goto(owner.id)

    await ownerDetails.clickPetButton(pet.name, "Add Visit")

    await expect(visitForm.newHeading).toBeVisible()
    await expect(visitForm.petTable.getByRole("cell")).toHaveText([pet.name, pet.birthDate, pet.type.name, fullName(owner)])
  })

  test("VIS-003 New Visit page lists previous visits", { tag: "@regression" }, async ({ ownerDetails, visitForm, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const visit = await data.visit(owner, pet)
    await ownerDetails.goto(owner.id)

    await ownerDetails.clickPetButton(pet.name, "Add Visit")

    await expect(visitForm.previousVisits.getByRole("row").filter({ hasText: visit.description })).toContainText(visit.date)
  })

  test("VIS-004 Description is required", { tag: "@negative" }, async ({ ownerDetails, visitForm, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    await ownerDetails.goto(owner.id)
    await ownerDetails.clickPetButton(pet.name, "Add Visit")

    await visitForm.description.fill("x")
    await visitForm.description.fill("")
    await visitForm.description.blur()

    await expect(visitForm.message("Description is required")).toBeVisible()
  })

  test("VIS-005 Empty New Visit form is not submitted", { tag: "@negative" }, async ({ page, ownerDetails, visitForm, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    await ownerDetails.goto(owner.id)
    await ownerDetails.clickPetButton(pet.name, "Add Visit")
    await visitForm.waitUntilLoaded()

    const post = await requestDuring(page, request => request.method() === "POST" && request.url().includes("/visits"), () => visitForm.submit(visitForm.addVisitButton))

    await knownBug("BUG-003", async () => {
      expect(post?.postData() ?? null, "no request is sent for an empty form").toBeNull()
      await expect(visitForm.message("Description is required")).toBeVisible()
    })
  })

  test("VIS-006 Date given, description empty", { tag: "@negative" }, async ({ page, ownerDetails, visitForm, data, petclinic }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    await ownerDetails.goto(owner.id)
    await ownerDetails.clickPetButton(pet.name, "Add Visit")
    await expect(visitForm.newHeading).toBeVisible()

    await visitForm.fill({ date: VISIT_DATE.ui })
    const post = await requestDuring(page, request => request.method() === "POST" && request.url().includes("/visits"), () => visitForm.submit(visitForm.addVisitButton))

    test.info().annotations.push({ type: "observed", description: `POST sent: ${post !== null}` })
    await expect(page).toHaveURL(`/pets/${pet.id}/visits/add`)
    expect((await petclinic.getPet(pet.id)).visits).toHaveLength(0)
  })

  test("VIS-010 Back on New Visit returns to the owner", { tag: "@regression" }, async ({ page, ownerDetails, visitForm, data, petclinic }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    await ownerDetails.goto(owner.id)
    await ownerDetails.clickPetButton(pet.name, "Add Visit")
    await visitForm.fill({ description: `Unsaved ${unique()}` })

    await visitForm.backButton.click()

    await expect(page).toHaveURL(`/owners/${owner.id}`)
    expect((await petclinic.getPet(pet.id)).visits).toHaveLength(0)
  })
})

test.describe("Edit and delete visit", () => {
  test("VIS-007 Edit a visit", { tag: "@regression" }, async ({ ownerDetails, visitForm, data, petclinic }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const visit = await data.visit(owner, pet)
    const description = `Edited ${unique()}`
    await ownerDetails.goto(owner.id)
    await ownerDetails.clickVisitButton(pet.name, visit.description, "Edit Visit")
    await expect(visitForm.editHeading).toBeVisible()
    await expect(visitForm.description).toHaveValue(visit.description)

    await visitForm.fill({ date: "2024/04/20", description })
    await visitForm.submit(visitForm.updateVisitButton)

    await expect(ownerDetails.visitRow(pet.name, description).getByRole("cell")).toHaveText(["2024-04-20", description, /Edit Visit\s*Delete Visit/])
    expect(await petclinic.getVisit(visit.id)).toMatchObject({ date: "2024-04-20", description })
  })

  test("VIS-008 Delete a visit", { tag: "@regression" }, async ({ ownerDetails, data, petclinic }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const visit = await data.visit(owner, pet)
    await ownerDetails.goto(owner.id)

    await ownerDetails.clickVisitButton(pet.name, visit.description, "Delete Visit")

    await expect(ownerDetails.pet(pet.name).getByText(visit.description)).toBeHidden()
    await expect(ownerDetails.pet(pet.name)).toBeVisible()
    await expect.poll(() => petclinic.status("visits", visit.id)).toBe(404)
  })

  test("VIS-009 Deleting a visit asks for confirmation", { tag: "@regression" }, async ({ page, ownerDetails, data, petclinic }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const visit = await data.visit(owner, pet)
    await ownerDetails.goto(owner.id)
    const dialogs: string[] = []
    page.on("dialog", dialog => { dialogs.push(dialog.message()); void dialog.dismiss() })

    await ownerDetails.clickVisitButton(pet.name, visit.description, "Delete Visit")

    await knownBug("BUG-004", async () => {
      await expect.poll(() => dialogs.length).toBe(1)
      await expect(ownerDetails.visitRow(pet.name, visit.description)).toBeVisible()
      expect(await petclinic.status("visits", visit.id)).toBe(200)
    })
  })
})
