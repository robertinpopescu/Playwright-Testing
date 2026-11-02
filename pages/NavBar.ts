import type { Locator, Page } from "@playwright/test"

export class NavBar {
  readonly nav: Locator

  constructor(private readonly page: Page) {
    this.nav = page.getByRole("navigation")
  }

  async openHome(): Promise<void> {
    await this.nav.getByRole("link", { name: "Home" }).click()
  }

  async openOwnersSearch(): Promise<void> {
    await this.openDropdownItem("Owners", /search/i)
  }

  async openOwnersAddNew(): Promise<void> {
    await this.openDropdownItem("Owners", /add new/i)
  }

  async openVetsAll(): Promise<void> {
    await this.openDropdownItem("Veterinarians", /^\s*all\s*$/i)
  }

  async openVetsAddNew(): Promise<void> {
    await this.openDropdownItem("Veterinarians", /add new/i)
  }

  async openPetTypes(): Promise<void> {
    await this.nav.getByRole("link", { name: "Pet Types" }).click()
  }

  async openSpecialties(): Promise<void> {
    await this.nav.getByRole("link", { name: "Specialties" }).click()
  }

  // Both dropdowns contain an "Add New" link, so the item is looked up inside its own menu
  dropdown(menu: "Owners" | "Veterinarians"): Locator {
    return this.nav.getByRole("listitem").filter({ has: this.page.getByRole("button", { name: menu }) })
  }

  private async openDropdownItem(menu: "Owners" | "Veterinarians", item: RegExp): Promise<void> {
    const dropdown = this.dropdown(menu)
    await dropdown.getByRole("button", { name: menu }).click()
    await dropdown.getByRole("link", { name: item }).click()
  }
}
