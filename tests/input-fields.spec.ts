import { test as base, expect } from "../fixtures/api"
import { uniqueName } from "../test-data/builders"

type PetType = { id: number, name: string }

// Each test works on its own pet type, created and deleted via the API by id,
// so pre-existing records such as "cat" are never modified
const test = base.extend<{ petType: PetType }>({
  petType: async ({ api }, use) => {
    const createResponse = await api.post("pettypes", { data: { name: uniqueName("Type") } })
    expect(createResponse.status()).toBe(201)
    const petType: PetType = await createResponse.json()

    await use(petType)

    const deleteResponse = await api.delete(`pettypes/${petType.id}`)
    expect(deleteResponse.status()).toBe(204)
  }
})

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("Pet types", async ({ page, petType }) => {
  const renamedPetType = uniqueName("Renamed")

  // 1. Select the PET TYPES menu item in the navigation bar
  await page.getByRole("link", { name: "Pet Types" }).click()

  // 2. Add assertion of the "Pet Types" text displayed above the table with the list of pet types
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Pet Types")

  // 3. Click on "Edit" button for the pet type created for this test
  await page.getByRole("row", { name: petType.name }).getByRole("button", { name: "Edit" }).click()

  // 4. Add assertion of the "Edit Pet Type" text displayed
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Edit Pet Type")

  // 5. Rename the pet type and click "Update" button
  await expect(page.getByRole("textbox")).toHaveValue(petType.name)
  await page.getByRole("textbox").fill(renamedPetType)
  await page.getByRole("button", { name: "Update" }).click()

  // 6. Add the assertion that the pet type is listed with the new name
  await expect(page.getByRole("row", { name: renamedPetType }).getByRole("textbox")).toHaveValue(renamedPetType)

  // 7. Click on "Edit" button for the same renamed pet type
  await page.getByRole("row", { name: renamedPetType }).getByRole("button", { name: "Edit" }).click()

  // 8. Change the pet type name back and click "Update" button
  await expect(page.getByRole("textbox")).toHaveValue(renamedPetType)
  await page.getByRole("textbox").fill(petType.name)
  await page.getByRole("button", { name: "Update" }).click()

  // 9. Add the assertion that the pet type is listed with its original name again
  await expect(page.getByRole("row", { name: petType.name }).getByRole("textbox")).toHaveValue(petType.name)
})
