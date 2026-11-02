import type { Locator, Page } from "@playwright/test"

// Veterinarians → All (/vets)
export class VetsPage {
  readonly heading: Locator
  readonly table: Locator
  readonly rows: Locator
  readonly homeButton: Locator
  readonly addVetButton: Locator

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "Veterinarians", level: 2 })
    this.table = page.locator("#vets")
    this.rows = this.table.locator("tbody > tr")
    this.homeButton = page.getByRole("button", { name: "Home" })
    this.addVetButton = page.getByRole("button", { name: "Add Vet" })
  }

  async goto(): Promise<void> {
    await this.page.goto("/vets")
  }

  row(fullName: string): Locator {
    return this.rows.filter({ hasText: fullName })
  }

  specialtiesCell(fullName: string): Locator {
    return this.row(fullName).getByRole("cell").nth(1)
  }

  async clickRowButton(fullName: string, button: "Edit Vet" | "Delete Vet"): Promise<void> {
    await this.row(fullName).getByRole("button", { name: button }).click()
  }
}
