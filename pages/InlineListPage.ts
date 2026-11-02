import { expect, type Locator, type Page } from "@playwright/test"

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Pet Types and Specialties share one layout: a table of read-only name inputs with
// Edit/Delete per row, an inline "New …" form, and a separate "Edit …" page
export class InlineListPage {
  readonly heading: Locator
  readonly newFormHeading: Locator
  readonly editHeading: Locator
  readonly rows: Locator
  readonly homeButton: Locator
  readonly addButton: Locator
  // The inline Name fields have no accessible name (see A11Y-004), so they are located by id
  readonly newNameInput: Locator
  readonly saveButton: Locator
  readonly editNameInput: Locator
  readonly updateButton: Locator
  readonly cancelButton: Locator

  constructor(
    protected readonly page: Page,
    private readonly path: string,
    texts: { heading: string, newForm: string, edit: string }
  ) {
    this.heading = page.getByRole("heading", { name: texts.heading, exact: true, level: 2 })
    this.newFormHeading = page.getByRole("heading", { name: texts.newForm, level: 2 })
    this.editHeading = page.getByRole("heading", { name: texts.edit, level: 2 })
    this.rows = page.locator("table tbody tr")
    this.homeButton = page.getByRole("button", { name: "Home" })
    this.addButton = page.getByRole("button", { name: "Add", exact: true })
    this.newNameInput = page.locator("form input#name")
    this.saveButton = page.getByRole("button", { name: "Save", exact: true })
    this.editNameInput = page.locator("input#name")
    this.updateButton = page.getByRole("button", { name: "Update" })
    this.cancelButton = page.getByRole("button", { name: "Cancel" })
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path)
  }

  // Exact match on the row's accessible name ("<name> Edit Delete"), so "QaType1" never
  // matches "QaType10"
  row(name: string): Locator {
    return this.page.getByRole("row", { name: new RegExp(`^${escapeRegExp(name)} Edit Delete$`) })
  }

  nameField(name: string): Locator {
    return this.row(name).getByRole("textbox")
  }

  async names(): Promise<string[]> {
    return this.rows.getByRole("textbox").evaluateAll(inputs => inputs.map(input => (input as HTMLInputElement).value))
  }

  async add(name: string): Promise<void> {
    await this.addButton.click()
    await this.newNameInput.fill(name)
    await this.saveButton.click()
  }

  async clickEdit(name: string): Promise<void> {
    await this.row(name).getByRole("button", { name: "Edit" }).click()
  }

  async clickDelete(name: string): Promise<void> {
    await this.row(name).getByRole("button", { name: "Delete" }).click()
  }

  // Waits for the edit form to load the current name; filling earlier would be overwritten
  async openEdit(currentName: string): Promise<void> {
    await this.clickEdit(currentName)
    await expect(this.editHeading).toBeVisible()
    await expect(this.editNameInput).toHaveValue(currentName)
  }

  async rename(currentName: string, newName: string): Promise<void> {
    await this.openEdit(currentName)
    await this.editNameInput.fill(newName)
    await this.updateButton.click()
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true })
  }
}

export class PetTypesPage extends InlineListPage {
  constructor(page: Page) {
    super(page, "/pettypes", { heading: "Pet Types", newForm: "New Pet Type", edit: "Edit Pet Type" })
  }
}

export class SpecialtiesPage extends InlineListPage {
  constructor(page: Page) {
    super(page, "/specialties", { heading: "Specialties", newForm: "New Specialty", edit: "Edit Specialty" })
  }
}
