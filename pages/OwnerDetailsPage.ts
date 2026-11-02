import type { Locator, Page } from "@playwright/test"

// Owner Information page (/owners/{id}) with the owner's pets and their visits
export class OwnerDetailsPage {
  readonly heading: Locator
  readonly petsHeading: Locator
  readonly backButton: Locator
  readonly editOwnerButton: Locator
  readonly addNewPetButton: Locator

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "Owner Information", level: 2 })
    this.petsHeading = page.getByRole("heading", { name: "Pets and Visits", level: 2 })
    this.backButton = page.getByRole("button", { name: "Back", exact: true })
    this.editOwnerButton = page.getByRole("button", { name: "Edit Owner" })
    this.addNewPetButton = page.getByRole("button", { name: "Add New Pet" })
  }

  async goto(ownerId: number): Promise<void> {
    await this.page.goto(`/owners/${ownerId}`)
  }

  // Name, Address, City, Telephone are table rows with a row header and one cell
  field(label: "Name" | "Address" | "City" | "Telephone"): Locator {
    return this.page.getByRole("row", { name: label }).filter({ has: this.page.getByRole("rowheader", { name: label }) }).getByRole("cell")
  }

  // One block per pet: name/birth date/type, its buttons and its visits table
  pet(petName: string): Locator {
    return this.page.locator("app-pet-list").filter({ hasText: petName })
  }

  // An empty app-pet-list element stays in the page after the last pet is deleted,
  // so only blocks that show a pet (with its buttons) are counted
  allPets(): Locator {
    return this.page.locator("app-pet-list").filter({ has: this.page.getByRole("button", { name: "Edit Pet" }) })
  }

  petDetail(petName: string, term: "Name" | "Birth Date" | "Type"): Locator {
    return this.pet(petName).getByRole("term").filter({ hasText: term }).locator("xpath=following-sibling::dd[1]")
  }

  // The visits table is nested inside the pet's row, so the outer rows also contain the
  // description; the visit's own row is the innermost (last) match
  visitRow(petName: string, description: string): Locator {
    return this.pet(petName).getByRole("row").filter({ hasText: description }).last()
  }

  async clickPetButton(petName: string, button: "Edit Pet" | "Delete Pet" | "Add Visit"): Promise<void> {
    await this.pet(petName).getByRole("button", { name: button }).click()
  }

  async clickVisitButton(petName: string, description: string, button: "Edit Visit" | "Delete Visit"): Promise<void> {
    await this.visitRow(petName, description).getByRole("button", { name: button }).click()
  }
}
