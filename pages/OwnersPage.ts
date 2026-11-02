import type { Locator, Page, Response } from "@playwright/test"

// Owners → Search (/owners): list of owners and search by last name
export class OwnersPage {
  readonly heading: Locator
  // The search box has no accessible name (see A11Y-004), so it is located by its id
  readonly lastNameInput: Locator
  readonly findOwnerButton: Locator
  readonly addOwnerButton: Locator
  readonly table: Locator
  // Each owner row contains a nested table of pet names, so only direct rows are counted
  readonly ownerRows: Locator

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "Owners", level: 2 })
    this.lastNameInput = page.locator("#lastName")
    this.findOwnerButton = page.getByRole("button", { name: "Find Owner" })
    this.addOwnerButton = page.getByRole("button", { name: "Add Owner" })
    this.table = page.locator("table.table-striped")
    this.ownerRows = this.table.locator(":scope > tbody > tr")
  }

  async goto(): Promise<void> {
    await this.page.goto("/owners")
  }

  // Waits for this search's own request (lastName in the query, or the plain list for an
  // empty search), so assertions run against the new result
  async search(lastName: string): Promise<Response> {
    await this.lastNameInput.fill(lastName)
    const response = this.page.waitForResponse(res => {
      if (res.request().method() !== "GET") return false
      const url = new URL(res.url())
      if (!url.pathname.endsWith("/api/owners")) return false
      // The app drops trailing spaces from the search text, so values are compared trimmed
      return lastName.trim() === "" ? !url.searchParams.has("lastName") : url.searchParams.get("lastName")?.trim() === lastName.trim()
    })
    await this.findOwnerButton.click()
    return response
  }

  ownerRow(fullName: string): Locator {
    return this.ownerRows.filter({ has: this.page.getByRole("link", { name: fullName, exact: true }) })
  }

  async openOwner(fullName: string): Promise<void> {
    await this.page.getByRole("link", { name: fullName, exact: true }).click()
  }

  noResultsMessage(lastName: string): Locator {
    return this.page.getByText(`No owners with LastName starting with "${lastName}"`)
  }
}
