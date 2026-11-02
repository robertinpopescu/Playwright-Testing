import { expect, fullName, knownBug, requestDuring, test } from "../../fixtures"
import { uniqueName } from "../../test-data/builders"

test.describe("Vet list and create", () => {
  test("VET-001 Vet list shows names and specialties", { tag: "@smoke" }, async ({ page, vetsPage, petclinic }) => {
    const vets = await petclinic.listVets()
    await vetsPage.goto()

    await expect(vetsPage.heading).toBeVisible()
    await expect(vetsPage.table.getByRole("columnheader", { name: "Name" })).toBeVisible()
    await expect(vetsPage.table.getByRole("columnheader", { name: "Specialties" })).toBeVisible()
    await expect(vetsPage.rows).toHaveCount(vets.length)
    for (const vet of vets) {
      const row = vetsPage.row(fullName(vet))
      for (const specialty of vet.specialties) await expect(row, fullName(vet)).toContainText(specialty.name)
      await expect(row.getByRole("button", { name: "Edit Vet" })).toBeVisible()
      await expect(row.getByRole("button", { name: "Delete Vet" })).toBeVisible()
    }
    await expect(vetsPage.homeButton).toBeVisible()
    await expect(page.getByRole("button", { name: "Add Vet" })).toBeVisible()
  })

  test("VET-002 Create a vet with a specialty", { tag: "@smoke" }, async ({ page, vetForm, vetsPage, data }) => {
    const vet = { firstName: uniqueName(), lastName: uniqueName() }
    await vetForm.gotoNew()

    await vetForm.firstName.fill(vet.firstName)
    await vetForm.lastName.fill(vet.lastName)
    await vetForm.newSpecialtySelect.selectOption("radiology")
    await data.watch("vets")
    await vetForm.saveVetButton.click()

    await expect(page).toHaveURL("/vets")
    await expect(vetsPage.specialtiesCell(fullName(vet))).toHaveText("radiology")
  })

  test("VET-003 Create a vet without a specialty", { tag: "@regression" }, async ({ page, vetForm, vetsPage, data }) => {
    const vet = { firstName: uniqueName(), lastName: uniqueName() }
    await vetForm.gotoNew()

    await vetForm.firstName.fill(vet.firstName)
    await vetForm.lastName.fill(vet.lastName)
    await data.watch("vets")
    await vetForm.saveVetButton.click()

    await expect(page).toHaveURL("/vets")
    await expect(vetsPage.specialtiesCell(fullName(vet))).toHaveText("")
  })

  test("VET-004 Required-field messages on New Veterinarian", { tag: "@negative" }, async ({ vetForm }) => {
    await vetForm.gotoNew()

    for (const field of [vetForm.firstName, vetForm.lastName]) {
      await field.fill("x")
      await field.fill("")
      await field.blur()
    }

    await expect(vetForm.message("First name is required")).toBeVisible()
    await expect(vetForm.message("Last name is required")).toBeVisible()
  })

  test("VET-005 Save Vet on an empty form gives feedback", { tag: "@negative" }, async ({ page, vetForm, data }) => {
    await vetForm.gotoNew()
    await expect(vetForm.newHeading).toBeVisible()
    await data.watch("vets")

    await knownBug("BUG-005", async () => {
      // Correct: the button is disabled, or clicking it shows messages; never a request
      if (await vetForm.saveVetButton.isDisabled()) return
      const post = await requestDuring(page, request => request.method() === "POST" && request.url().includes("/vets"), () => vetForm.saveVetButton.click())
      expect(post, "no request for an empty form").toBeNull()
      await expect(page.getByText(/is required/).first()).toBeVisible()
    })
  })

  test("VET-006 New Veterinarian specialty field matches Edit Vet", { tag: "@regression" }, async ({ page, vetForm }) => {
    await vetForm.gotoNew()
    await expect(vetForm.newHeading).toBeVisible()
    await expect(vetForm.firstName).toBeVisible()

    // Scoped to the form: the navbar also contains a "Specialties" link
    const form = page.locator("form")
    await knownBug("BUG-006", async () => {
      await expect(form.getByText("Specialties", { exact: true })).toBeVisible()
      await expect(form.getByText("Type", { exact: true })).toBeHidden()
    })
  })
})

test.describe("Edit and delete vet", () => {
  test("VET-007 Edit a vet's names and specialties", { tag: "@regression" }, async ({ page, vetsPage, vetForm, data, petclinic }) => {
    const vet = await data.vet()
    const changes = { firstName: uniqueName("Edited"), lastName: uniqueName("Edited") }
    await vetsPage.goto()
    await vetsPage.clickRowButton(fullName(vet), "Edit Vet")
    await expect(vetForm.editHeading).toBeVisible()
    await expect(vetForm.firstName).toHaveValue(vet.firstName)

    await vetForm.firstName.fill(changes.firstName)
    await vetForm.lastName.fill(changes.lastName)
    await vetForm.setEditSpecialties(["radiology", "surgery"])
    await vetForm.saveVetButton.click()

    await expect(page).toHaveURL("/vets")
    await expect(vetsPage.specialtiesCell(fullName(changes))).toContainText("radiology")
    await expect(vetsPage.specialtiesCell(fullName(changes))).toContainText("surgery")
    const saved = await petclinic.getVet(vet.id)
    expect(saved).toMatchObject(changes)
    expect(saved.specialties.map(specialty => specialty.name).sort()).toEqual(["radiology", "surgery"])
  })

  test("VET-008 Edit Vet validation", { tag: "@negative" }, async ({ vetsPage, vetForm, data }) => {
    const vet = await data.vet()
    await vetsPage.goto()
    await vetsPage.clickRowButton(fullName(vet), "Edit Vet")
    await expect(vetForm.firstName).toHaveValue(vet.firstName)

    await vetForm.firstName.fill("")
    await vetForm.lastName.fill("")
    await vetForm.lastName.blur()

    await expect(vetForm.message("First name is required")).toBeVisible()
    await expect(vetForm.message("Last name is required")).toBeVisible()
    await expect(vetForm.saveVetButton).toBeDisabled()
  })

  test("VET-009 Delete a vet", { tag: "@regression" }, async ({ vetsPage, data, petclinic }) => {
    const vet = await data.vet()
    await vetsPage.goto()

    await vetsPage.clickRowButton(fullName(vet), "Delete Vet")

    await expect(vetsPage.row(fullName(vet))).toHaveCount(0)
    await expect.poll(() => petclinic.status("vets", vet.id)).toBe(404)
  })

  test("VET-010 Deleting a vet asks for confirmation", { tag: "@regression" }, async ({ page, vetsPage, data, petclinic }) => {
    const vet = await data.vet()
    await vetsPage.goto()
    const dialogs: string[] = []
    page.on("dialog", dialog => { dialogs.push(dialog.message()); void dialog.dismiss() })

    await vetsPage.clickRowButton(fullName(vet), "Delete Vet")

    await knownBug("BUG-004", async () => {
      await expect.poll(() => dialogs.length).toBe(1)
      await expect(vetsPage.row(fullName(vet))).toHaveCount(1)
      expect(await petclinic.status("vets", vet.id)).toBe(200)
    })
  })

  test("VET-011 Back on Edit Vet discards changes", { tag: "@regression" }, async ({ page, vetsPage, vetForm, data, petclinic }) => {
    const vet = await data.vet()
    await vetsPage.goto()
    await vetsPage.clickRowButton(fullName(vet), "Edit Vet")
    await expect(vetForm.firstName).toHaveValue(vet.firstName)

    await vetForm.firstName.fill(uniqueName("Changed"))
    await vetForm.backButton.click()

    await expect(page).toHaveURL("/vets")
    await expect(vetsPage.row(fullName(vet))).toHaveCount(1)
    expect((await petclinic.getVet(vet.id)).firstName).toBe(vet.firstName)
  })
})
