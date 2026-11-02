import { expect, type Locator, type Page } from "@playwright/test"

// Add Pet (/owners/{id}/pets/add) and Edit Pet (/pets/{id}/edit, heading "Pet")
export class PetFormPage {
  readonly addHeading: Locator
  readonly editHeading: Locator
  // Owner and Birth Date have no accessible name (see A11Y-004), so they are located by id/name
  readonly ownerName: Locator
  readonly name: Locator
  readonly birthDate: Locator
  readonly openCalendarButton: Locator
  readonly type: Locator
  readonly backButton: Locator
  readonly savePetButton: Locator
  readonly updatePetButton: Locator

  constructor(private readonly page: Page) {
    this.addHeading = page.getByRole("heading", { name: "Add Pet", level: 2 })
    this.editHeading = page.getByRole("heading", { name: "Pet", exact: true, level: 2 })
    this.ownerName = page.locator("#owner_name")
    this.name = page.getByRole("textbox", { name: "Name" })
    this.birthDate = page.locator("input[name='birthDate']")
    this.openCalendarButton = page.getByRole("button", { name: "Open calendar" })
    this.type = page.getByRole("combobox", { name: "Type" })
    this.backButton = page.getByRole("button", { name: "< Back" })
    this.savePetButton = page.getByRole("button", { name: "Save Pet" })
    this.updatePetButton = page.getByRole("button", { name: "Update Pet" })
  }

  // The form posts to owners/undefined/pets if it is submitted before the owner has loaded,
  // so every action waits until the Owner field is filled
  async waitUntilLoaded(): Promise<void> {
    await expect(this.ownerName).toHaveValue(/\S/)
  }

  async fill(pet: { name?: string, birthDate?: string, type?: string }): Promise<void> {
    await this.waitUntilLoaded()
    if (pet.name !== undefined) await this.name.fill(pet.name)
    if (pet.birthDate !== undefined) await this.birthDate.fill(pet.birthDate)
    if (pet.type !== undefined) await this.type.selectOption(pet.type)
  }

  // Picks a day of the previous month in the calendar; returns the date as yyyy-MM-dd
  async pickBirthDateInCalendar(day: number): Promise<string> {
    await this.openCalendarButton.click()
    await this.page.getByRole("button", { name: "Previous month" }).click()
    const dayButton = this.page.getByRole("dialog").getByRole("button", { name: new RegExp(`/${String(day).padStart(2, "0")}$`) })
    const label = await dayButton.getAttribute("aria-label") ?? ""
    await dayButton.click()
    return label.replaceAll("/", "-")
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true })
  }
}
