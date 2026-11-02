import { expect, type Locator, type Page } from "@playwright/test"

// New Visit (/pets/{id}/visits/add) and Edit Visit (/visits/{id}/edit)
export class VisitFormPage {
  readonly newHeading: Locator
  readonly editHeading: Locator
  readonly petTable: Locator
  // Date and Description have no accessible name (see A11Y-004), so they are located by name
  readonly date: Locator
  readonly description: Locator
  readonly backButton: Locator
  readonly addVisitButton: Locator
  readonly updateVisitButton: Locator
  readonly previousVisits: Locator

  constructor(private readonly page: Page, private readonly isMobile: boolean = false) {
    this.newHeading = page.getByRole("heading", { name: "New Visit", level: 2 })
    this.editHeading = page.getByRole("heading", { name: "Edit Visit", level: 2 })
    this.petTable = page.getByRole("table").filter({ has: page.getByRole("columnheader", { name: "Owner" }) })
    this.date = page.locator("input[name='date']")
    this.description = page.locator("input[name='description']")
    this.backButton = page.getByRole("button", { name: "Back", exact: true })
    this.addVisitButton = page.getByRole("button", { name: "Add Visit" })
    this.updateVisitButton = page.getByRole("button", { name: "Update Visit" })
    this.previousVisits = page.getByRole("table").filter({ has: page.getByRole("columnheader", { name: "Visit Date" }) })
  }

  // The page renders before the pet has loaded; on small screens the layout keeps moving
  // under the loading overlay until then, so clicks can land on the wrong element
  async waitUntilLoaded(): Promise<void> {
    await expect(this.petTable.getByRole("cell").first()).not.toBeEmpty()
    await expect(this.page.locator("app-loading-spinner .overlay")).toBeHidden()
  }

  async fill(visit: { date?: string, description?: string }): Promise<void> {
    await this.waitUntilLoaded()
    if (visit.date !== undefined) await this.date.fill(visit.date)
    if (visit.description !== undefined) await this.description.fill(visit.description)
  }

  // On phones the form is wider than the screen (see RSP-002), so the browser pans the view
  // after an input is focused and pointer clicks miss the button. Focus + Enter is the
  // keyboard way to press the same button and works reliably there.
  async submit(button: Locator): Promise<void> {
    if (!this.isMobile) return button.click()
    await button.focus()
    await this.page.keyboard.press("Enter")
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true })
  }
}
