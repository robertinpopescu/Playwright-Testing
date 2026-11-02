import type { Locator, Page } from "@playwright/test"
import type { OwnerInput } from "../api/types"

// New Owner (/owners/add) and Edit Owner (/owners/{id}/edit) share this form
export class OwnerFormPage {
  readonly newHeading: Locator
  readonly editHeading: Locator
  readonly firstName: Locator
  readonly lastName: Locator
  readonly address: Locator
  readonly city: Locator
  readonly telephone: Locator
  readonly backButton: Locator
  readonly addOwnerButton: Locator
  readonly updateOwnerButton: Locator

  constructor(private readonly page: Page) {
    this.newHeading = page.getByRole("heading", { name: "New Owner", level: 2 })
    this.editHeading = page.getByRole("heading", { name: "Edit Owner", level: 2 })
    this.firstName = page.getByRole("textbox", { name: "First Name" })
    this.lastName = page.getByRole("textbox", { name: "Last Name" })
    this.address = page.getByRole("textbox", { name: "Address" })
    this.city = page.getByRole("textbox", { name: "City" })
    this.telephone = page.getByRole("textbox", { name: "Telephone" })
    this.backButton = page.getByRole("button", { name: "Back", exact: true })
    this.addOwnerButton = page.getByRole("button", { name: "Add Owner" })
    this.updateOwnerButton = page.getByRole("button", { name: "Update Owner" })
  }

  async gotoNew(): Promise<void> {
    await this.page.goto("/owners/add")
  }

  async fill(owner: Partial<OwnerInput>): Promise<void> {
    const fields: [Locator, string | undefined][] = [
      [this.firstName, owner.firstName],
      [this.lastName, owner.lastName],
      [this.address, owner.address],
      [this.city, owner.city],
      [this.telephone, owner.telephone]
    ]
    for (const [field, value] of fields) {
      if (value !== undefined) await field.fill(value)
    }
  }

  // Type and clear each field: Angular shows "required" messages only for edited fields
  async clearAllFields(): Promise<void> {
    for (const field of [this.firstName, this.lastName, this.address, this.city, this.telephone]) {
      await field.fill("x")
      await field.fill("")
      await field.blur()
    }
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true })
  }
}
