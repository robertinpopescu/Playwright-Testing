import type { Locator, Page } from "@playwright/test"

// New Veterinarian (/vets/add) and Edit Veterinarian (/vets/{id}/edit)
export class VetFormPage {
  readonly newHeading: Locator
  readonly editHeading: Locator
  readonly firstName: Locator
  readonly lastName: Locator
  // New Veterinarian: single select labelled "Type" (BUG-006)
  readonly newSpecialtySelect: Locator
  readonly backButton: Locator
  readonly saveVetButton: Locator

  constructor(private readonly page: Page) {
    this.newHeading = page.getByRole("heading", { name: "New Veterinarian", level: 2 })
    this.editHeading = page.getByRole("heading", { name: "Edit Veterinarian", level: 2 })
    this.firstName = page.getByRole("textbox", { name: "First Name" })
    this.lastName = page.getByRole("textbox", { name: "Last Name" })
    this.newSpecialtySelect = page.locator("select#specialties")
    this.backButton = page.getByRole("button", { name: "< Back" })
    this.saveVetButton = page.getByRole("button", { name: "Save Vet" })
  }

  async gotoNew(): Promise<void> {
    await this.page.goto("/vets/add")
  }

  // Edit Veterinarian: one checkbox per specialty inside a dropdown. The open dropdown
  // covers the Save Vet button, so it is closed again afterwards.
  async setEditSpecialties(names: string[]): Promise<void> {
    const toggle = this.page.getByText("Specialties", { exact: true }).locator("xpath=following-sibling::*[1]")
    await toggle.click()
    for (const checkbox of await this.page.locator("input[type='checkbox']").all()) {
      const id = await checkbox.getAttribute("id") ?? ""
      await checkbox.setChecked(names.includes(id))
    }
    await toggle.click()
  }

  editSpecialtyOptions(): Locator {
    return this.page.locator("input[type='checkbox']")
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true })
  }
}
