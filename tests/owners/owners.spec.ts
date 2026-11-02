import { expect, fullName, knownBug, test } from "../../fixtures"
import { ownerData, unique, uniqueName } from "../../test-data/builders"

const REQUIRED_MESSAGES = [
  "First name is required",
  "Last name is required",
  "Address is required",
  "City is required",
  "Phone number is required"
]

test.describe("Owner list and search", () => {
  test("OWN-001 Owner list shows all owners with the expected columns", { tag: "@smoke" }, async ({ page, ownersPage, petclinic }) => {
    const owners = await petclinic.listOwners()
    await ownersPage.goto()

    await expect(ownersPage.heading).toBeVisible()
    await expect(page.getByRole("columnheader")).toHaveText(["Name", "Address", "City", "Telephone", "Pets"])
    await expect(ownersPage.ownerRows).toHaveCount(owners.length)
    await expect(ownersPage.addOwnerButton).toBeVisible()
  })

  test("OWN-002 Search by full last name finds only matching owners", { tag: "@smoke" }, async ({ ownersPage, data }) => {
    // Both last names share the marker and run stamp, so only the random end differs
    const match = await data.owner()
    const other = await data.owner()
    await ownersPage.goto()

    await ownersPage.search(match.lastName)

    await expect(ownersPage.ownerRows).toHaveCount(1)
    await expect(ownersPage.ownerRow(fullName(match))).toBeVisible()
    await expect(ownersPage.ownerRow(fullName(other))).toHaveCount(0)
  })

  test("OWN-003 Search is case-insensitive", { tag: "@regression" }, async ({ ownersPage, data }) => {
    const owner = await data.owner()
    await ownersPage.goto()

    await ownersPage.search(owner.lastName.toLowerCase())

    await expect(ownersPage.ownerRow(fullName(owner))).toBeVisible()
  })

  test("OWN-004 Search matches the start of the last name", { tag: "@regression" }, async ({ ownersPage, data }) => {
    const owner = await data.owner()
    await ownersPage.goto()

    await ownersPage.search(owner.lastName.slice(0, 6))
    await expect(ownersPage.ownerRow(fullName(owner))).toBeVisible()

    const ending = owner.lastName.slice(-4)
    await ownersPage.search(ending)
    await expect(ownersPage.noResultsMessage(ending)).toBeVisible()
  })

  test("OWN-005 Search with no match shows a message", { tag: "@negative" }, async ({ ownersPage }) => {
    const lastName = `Zz${unique()}`
    await ownersPage.goto()

    await ownersPage.search(lastName)

    await expect(ownersPage.noResultsMessage(lastName)).toBeVisible()
    await expect(ownersPage.ownerRows).toHaveCount(0)
  })

  test("OWN-007 Empty search lists all owners", { tag: "@regression" }, async ({ ownersPage, data, petclinic }) => {
    const owner = await data.owner()
    await ownersPage.goto()
    await ownersPage.search(owner.lastName)
    await expect(ownersPage.ownerRows).toHaveCount(1)

    await ownersPage.search("")

    await expect(ownersPage.ownerRows).toHaveCount((await petclinic.listOwners()).length)
  })
})

test.describe("Create owner", () => {
  test("OWN-008 Create an owner with valid data", { tag: "@smoke" }, async ({ page, ownerForm, ownersPage, ownerDetails, data }) => {
    const owner = ownerData()
    await ownerForm.gotoNew()

    await ownerForm.fill(owner)
    data.expectOwner(owner.lastName)
    await ownerForm.addOwnerButton.click()
    await expect(page).toHaveURL("/owners")
    expect(await data.findOwnersByLastName(owner.lastName), "owner exists in the API").toHaveLength(1)

    await ownersPage.search(owner.lastName)
    await ownersPage.openOwner(fullName(owner))
    await expect(ownerDetails.heading).toBeVisible()
    await expect(ownerDetails.field("Name")).toHaveText(fullName(owner))
    await expect(ownerDetails.field("Address")).toHaveText(owner.address)
    await expect(ownerDetails.field("City")).toHaveText(owner.city)
    await expect(ownerDetails.field("Telephone")).toHaveText(owner.telephone)
  })

  test("OWN-009 Add Owner stays disabled until the form is valid", { tag: "@negative" }, async ({ ownerForm }) => {
    const owner = ownerData()
    await ownerForm.gotoNew()
    const steps: [keyof typeof owner, (value: string) => Promise<void>][] = [
      ["firstName", value => ownerForm.firstName.fill(value)],
      ["lastName", value => ownerForm.lastName.fill(value)],
      ["address", value => ownerForm.address.fill(value)],
      ["city", value => ownerForm.city.fill(value)]
    ]

    for (const [field, fill] of steps) {
      await expect(ownerForm.addOwnerButton, `before ${field}`).toBeDisabled()
      await fill(owner[field])
    }
    await expect(ownerForm.addOwnerButton, "before telephone").toBeDisabled()
    await ownerForm.telephone.fill(owner.telephone)
    await expect(ownerForm.addOwnerButton).toBeEnabled()
  })

  test("OWN-010 Required-field messages on New Owner", { tag: "@negative" }, async ({ ownerForm }) => {
    await ownerForm.gotoNew()

    await ownerForm.clearAllFields()

    for (const message of REQUIRED_MESSAGES) await expect(ownerForm.message(message)).toBeVisible()
    await expect(ownerForm.addOwnerButton).toBeDisabled()
  })

  for (const { firstName, valid } of [{ firstName: "A", valid: false }, { firstName: "Ab", valid: true }, { firstName: "Abc", valid: true }]) {
    test(`OWN-011 First name minimum length: "${firstName}" (${firstName.length} char)`, { tag: "@negative" }, async ({ ownerForm }) => {
      await ownerForm.gotoNew()

      await ownerForm.fill(ownerData({ firstName }))

      const message = ownerForm.message("First name must be at least 2 characters long")
      if (valid) {
        await expect(message).toBeHidden()
        await expect(ownerForm.addOwnerButton).toBeEnabled()
      } else {
        await expect(message).toBeVisible()
        await expect(ownerForm.addOwnerButton).toBeDisabled()
      }
    })
  }

  for (const telephone of ["abc", "+40-721", "608 555 00"]) {
    test(`OWN-012 Telephone rejects non-digits: "${telephone}"`, { tag: "@negative" }, async ({ ownerForm }) => {
      await ownerForm.gotoNew()

      await ownerForm.fill(ownerData({ telephone }))

      await expect(ownerForm.message("Phone number only accept digits")).toBeVisible()
      await expect(ownerForm.addOwnerButton).toBeDisabled()
    })
  }

  for (const { typed, kept } of [
    { typed: "608555000", kept: "608555000" },
    { typed: "6085550000", kept: "6085550000" },
    { typed: "60855500001", kept: "6085550000" }
  ]) {
    test(`OWN-013 Telephone maximum length: ${typed.length} digits`, { tag: "@negative" }, async ({ ownerForm }) => {
      await ownerForm.gotoNew()

      await ownerForm.telephone.pressSequentially(typed)

      await expect(ownerForm.telephone).toHaveValue(kept)
      await expect(ownerForm.message("Phone number only accept digits")).toBeHidden()
    })
  }

  test("OWN-019 Back on New Owner creates nothing", { tag: "@regression" }, async ({ page, ownerForm, data }) => {
    const owner = ownerData()
    await ownerForm.gotoNew()
    await ownerForm.fill(owner)
    data.expectOwner(owner.lastName)

    await ownerForm.backButton.click()

    await expect(page).toHaveURL("/owners")
    await expect(page.getByRole("heading", { name: "Owners", level: 2 })).toBeVisible()
    expect(await data.findOwnersByLastName(owner.lastName)).toHaveLength(0)
  })

  // Names with accents, apostrophes or hyphens are rejected by the API without feedback (BUG-010)
  const SPECIAL_OWNERS = [
    { label: "accented first name", bug: "BUG-010", overrides: { firstName: "José" } },
    { label: "apostrophe in last name", bug: "BUG-010", overrides: { lastName: `O'Brien${uniqueName()}` } },
    { label: "hyphenated last name", bug: "BUG-010", overrides: { lastName: `Smith-${uniqueName()}` } },
    { label: "Unicode letters in last name", bug: "BUG-010", overrides: { lastName: `Müller${uniqueName()}` } },
    { label: "Unicode address and city", overrides: { address: "Straße 5", city: "Łódź" } },
    { label: "255-character address", overrides: { address: "a".repeat(255) } }
  ]
  for (const { label, bug, overrides } of SPECIAL_OWNERS) {
    test(`OWN-021 Special characters and long values: ${label}`, { tag: "@negative" }, async ({ page, ownerForm, ownerDetails, data }) => {
      const owner = ownerData(overrides)
      await ownerForm.gotoNew()
      await ownerForm.fill(owner)
      data.expectOwner(owner.lastName)

      await ownerForm.addOwnerButton.click()

      const savedAndShown = async () => {
        await expect(page).toHaveURL("/owners")
        const [created] = await data.findOwnersByLastName(owner.lastName)
        expect(created, "owner was saved").toBeDefined()
        await ownerDetails.goto(created.id)
        await expect(ownerDetails.field("Name")).toHaveText(fullName(owner))
        await expect(ownerDetails.field("Address")).toHaveText(owner.address)
        await expect(ownerDetails.field("City")).toHaveText(owner.city)
      }
      if (bug) await knownBug(bug, savedAndShown)
      else await savedAndShown()
    })
  }
})

test.describe("Owner details and edit", () => {
  test("OWN-015 Owner details show pets and visits", { tag: "@smoke" }, async ({ page, ownerDetails, data }) => {
    const owner = await data.owner()
    const pet = await data.pet(owner)
    const visit = await data.visit(owner, pet)

    await ownerDetails.goto(owner.id)

    await expect(ownerDetails.heading).toBeVisible()
    await expect(ownerDetails.petsHeading).toBeVisible()
    await expect(ownerDetails.field("Name")).toHaveText(fullName(owner))
    await expect(ownerDetails.field("Address")).toHaveText(owner.address)
    await expect(ownerDetails.field("City")).toHaveText(owner.city)
    await expect(ownerDetails.field("Telephone")).toHaveText(owner.telephone)
    await expect(ownerDetails.petDetail(pet.name, "Name")).toHaveText(pet.name)
    await expect(ownerDetails.petDetail(pet.name, "Birth Date")).toHaveText(pet.birthDate)
    await expect(ownerDetails.petDetail(pet.name, "Type")).toHaveText(pet.type.name)
    await expect(ownerDetails.visitRow(pet.name, visit.description).getByRole("cell")).toHaveText([visit.date, visit.description, /Edit Visit\s*Delete Visit/])
    for (const name of ["Back", "Edit Owner", "Add New Pet", "Edit Pet", "Delete Pet", "Add Visit", "Edit Visit", "Delete Visit"]) {
      await expect(page.getByRole("button", { name, exact: true }), name).toBeVisible()
    }
  })

  test("OWN-016 Edit an owner", { tag: "@regression" }, async ({ ownerDetails, ownerForm, data, petclinic }) => {
    const owner = await data.owner()
    const changes = ownerData({ address: "2 Edit Ave", city: "Editville", telephone: "6085551111" })
    await ownerDetails.goto(owner.id)
    await ownerDetails.editOwnerButton.click()
    await expect(ownerForm.editHeading).toBeVisible()
    await expect(ownerForm.firstName).toHaveValue(owner.firstName)

    await ownerForm.fill(changes)
    await ownerForm.updateOwnerButton.click()

    await expect(ownerDetails.field("Name")).toHaveText(fullName(changes))
    await expect(ownerDetails.field("Address")).toHaveText(changes.address)
    await expect(ownerDetails.field("City")).toHaveText(changes.city)
    await expect(ownerDetails.field("Telephone")).toHaveText(changes.telephone)
    expect(await petclinic.getOwner(owner.id)).toMatchObject(changes)
  })

  test("OWN-017 Edit Owner validation", { tag: "@negative" }, async ({ page, ownerDetails, ownerForm, data }) => {
    const owner = await data.owner()
    await ownerDetails.goto(owner.id)
    await ownerDetails.editOwnerButton.click()
    await expect(ownerForm.firstName).toHaveValue(owner.firstName)
    const writes: string[] = []
    page.on("request", request => { if (request.method() === "PUT") writes.push(request.url()) })

    await ownerForm.clearAllFields()

    for (const message of REQUIRED_MESSAGES) await expect(ownerForm.message(message)).toBeVisible()
    await expect(ownerForm.updateOwnerButton).toBeDisabled()
    expect(writes).toHaveLength(0)
  })

  test("OWN-018 Back on Edit Owner discards changes", { tag: "@regression" }, async ({ page, ownerDetails, ownerForm, data, petclinic }) => {
    const owner = await data.owner()
    await ownerDetails.goto(owner.id)
    await ownerDetails.editOwnerButton.click()
    await expect(ownerForm.city).toHaveValue(owner.city)

    await ownerForm.city.fill(uniqueName("Changed"))
    await ownerForm.backButton.click()

    await expect(page).toHaveURL(`/owners/${owner.id}`)
    await expect(ownerDetails.field("City")).toHaveText(owner.city)
    expect((await petclinic.getOwner(owner.id)).city).toBe(owner.city)
  })

  test("OWN-020 Non-existent owner ID shows an error", { tag: "@negative" }, async ({ page, ownerDetails }) => {
    const response = page.waitForResponse(res => res.url().endsWith("/api/owners/999999999"))
    await ownerDetails.goto(999999999)
    expect((await response).status()).toBe(404)
    // Wait until the page has rendered, otherwise "hidden" would pass before the buttons appear
    await expect(ownerDetails.heading.or(page.getByText(/not found/i)).first()).toBeVisible()

    await knownBug("BUG-002", async () => {
      await expect(ownerDetails.editOwnerButton).toBeHidden()
      await expect(ownerDetails.addNewPetButton).toBeHidden()
    })
  })
})
