# Test Cases – PetClinic QA Automation

| | |
|---|---|
| **Application** | https://petclinic.bondaracademy.com · API https://petclinic-api.bondaracademy.com/petclinic/api/ |
| **Related** | [TEST-PLAN.md](TEST-PLAN.md) · [TEST-COVERAGE.md](TEST-COVERAGE.md) · [BUG-REPORTS.md](BUG-REPORTS.md) |
| **Status** | Phase 6 – automated; known bugs filed as BUG-001 – BUG-017 |
| **Date** | 2026-11-02 |

## How to read this document

Each test case has: **ID**, **title**, **priority**, **status**, **basis**, **tags**,
**preconditions**, **test data**, **steps** and **expected result**.

**Priority** follows [TEST-PLAN.md §9](TEST-PLAN.md#9-priority-definitions):
Critical · High · Medium · Low.

**Status**

| Status | Meaning |
|---|---|
| Automated (course assignment) | Automated before this QA project, as part of the course (`tests/homework.spec.ts`, `tests/input-fields.spec.ts`) |
| Automated | Automated in Phase 4 (shown as "To automate" until the 2026-11-02 version of this document) |
| Automated indirectly | No test of its own; covered by the `@smoke` tests that other Playwright projects run |
| Automated – known bug | Automated and marked with Playwright's `test.fail()` plus an `issue` annotation that names the bug (via the `knownBug()` helper in [fixtures/index.ts](../fixtures/index.ts)). The test asserts the **correct** behaviour:<br>• bug still present → reported as **expected to fail**, and the run stays green<br>• bug fixed → reported as a failure ("Expected to fail, but passed"); update BUG-REPORTS and remove `knownBug()`<br>• any other failure (setup before the bug check, cleanup after it) → reported as a **real** failure<br>`test.fail()` is set only when the bug assertion is reached, and a guard fixture checks that the bug assertion was the only error. `VERIFY_KNOWN_BUGS=1` runs these tests as normal tests, to see the real failure message. |
| Manual | Needs human judgement; run by hand and recorded in the execution report |
| Exploratory | Behaviour has no stated requirement. The actual result is recorded; it is not judged pass/fail and is not filed as a bug unless it causes a failure or data problem. "Exploratory (automated, records the result)" = a test tagged `@exploratory` writes the observed result into the report and asserts only what must always hold |

**Basis** – where the expected result comes from (the project has no written requirements):

| Basis | Meaning |
|---|---|
| Observed | Seen in the application during Phase 1/2 (texts, messages, button states are quoted exactly) |
| Consistency | Follows from how the same application behaves elsewhere (e.g. a saved value is displayed where that entity is shown) |
| To confirm | A detail not yet seen (e.g. the heading of a page that was never opened). It is checked against the application in Phase 4 **before** the assertion is written; a mismatch is investigated, not assumed to be a bug. **All "To confirm" details were checked on 2026-11-02 (Phase 4) and are now marked "Observed (Phase 4)".** |

### Common preconditions and conventions

These apply to **every** test case and are not repeated below.

* **PRE-1** Logged in through global setup (`.auth/auth-setup.ts`); the browser starts on `/`.
* **PRE-2** Records needed only as setup (e.g. an owner for a pet test) are created **via the API**
  with a unique name and deleted via the API after the test, even if it fails.
* **PRE-3** Pre-existing (seed) records are only read, never edited or deleted.
* **PRE-4** Edit forms are read only after the loading spinner (`role=progressbar`) has disappeared.

**Test-data notation**

* `<u>` – 8 random lowercase letters generated per test, e.g. `kqzmwafe`. Letters only, so the value
  is valid in any name field.
* `Qa<u>` – unique name, e.g. `Qakqzmwafe`. Everything a test creates starts with `Qa`, so leftovers
  are easy to find and remove.
* **Standard owner**: First Name `Qa<u>`, Last Name `Qa<u>`, Address `1 Test St`, City `Testville`,
  Telephone `6085550000`.
* **Standard pet**: Name `Rex<u>`, Birth Date `2020-01-15` (via the calendar: 2020/01/15), Type `dog`.
* **Standard visit**: Date `2024-03-10`, Description `Checkup <u>`.

---

## Contents

| Module | IDs | Cases |
|---|---|---|
| [Navigation](#navigation-nav) | NAV-001 – NAV-008 | 8 |
| [Owners](#owners-own) | OWN-001 – OWN-021 | 21 |
| [Pets](#pets-pet) | PET-001 – PET-014 | 14 |
| [Visits](#visits-vis) | VIS-001 – VIS-011 | 11 |
| [Veterinarians](#veterinarians-vet) | VET-001 – VET-011 | 11 |
| [Pet Types](#pet-types-pty) | PTY-001 – PTY-010 | 10 |
| [Specialties](#specialties-spc) | SPC-001 – SPC-008 | 8 |
| [Regression / consistency](#regression--consistency-reg) | REG-001 – REG-006 | 6 |
| [API](#api-api) | API-001 – API-018 | 18 |
| [Security](#security-sec) | SEC-001 – SEC-005 | 5 |
| [Accessibility](#accessibility-a11y) | A11Y-001 – A11Y-007 | 7 |
| [Responsive / cross-browser](#responsive--cross-browser-rsp) | RSP-001 – RSP-004 | 4 |
| **Total** | | **123** |

---

## Navigation (NAV)

### NAV-001 – Home page shows the welcome message
**Priority:** High · **Status:** Automated (course assignment) – `tests/homework.spec.ts` · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Open `/`.
* **Expected result:** Heading level 1 "Welcome to Petclinic" and heading level 2 "Welcome" are displayed.

### NAV-002 – Top-level navbar links open the correct pages
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** Links and expected results: Home → `/welcome`, "Welcome to Petclinic"; Pet Types → `/pettypes`, "Pet Types"; Specialties → `/specialties`, "Specialties".
* **Steps:**
  1. Click each navbar link in turn.
* **Expected result:** For each link, the URL and the heading match the test data.

### NAV-003 – Owners dropdown opens Search and Add New
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Click **Owners** → **Search**.
  2. Click **Owners** → **Add New**.
* **Expected result:**
  1. URL `/owners`, heading "Owners".
  2. URL `/owners/add`, heading "New Owner".

### NAV-004 – Veterinarians dropdown opens All and Add New
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Click **Veterinarians** → **All**.
  2. Click **Veterinarians** → **Add New**.
* **Expected result:**
  1. URL `/vets`, heading "Veterinarians".
  2. URL `/vets/add`, heading "New Veterinarian".

### NAV-005 – Every route opens directly by URL
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** –
* **Test data:** `/owners` "Owners", `/owners/add` "New Owner", `/vets` "Veterinarians", `/vets/add` "New Veterinarian", `/pettypes` "Pet Types", `/specialties` "Specialties".
* **Steps:**
  1. Open each URL directly (full page load).
* **Expected result:** Each page shows its heading; the navbar is present.

### NAV-006 – Unknown URL shows the 404 page
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** `/qa-no-such-page-<u>`
* **Steps:**
  1. Open the URL.
* **Expected result:** The 404 page is shown ("Oops! Page not found !" and "Not Found - 404 error") and the navbar still works.

### NAV-007 – Browser back and forward keep the right page
**Priority:** Low · **Status:** Automated · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Open Owners → Search, then Pet Types.
  2. Press browser **Back**, then **Forward**.
* **Expected result:**
  1. Back shows the "Owners" page.
  2. Forward shows the "Pet Types" page.

### NAV-008 – Each page has a descriptive title
**Priority:** Low · **Status:** Automated – known bug **BUG-007** · **Basis:** Consistency (WCAG 2.4.2) · **Tags:** @a11y

* **Preconditions:** –
* **Test data:** Routes from NAV-005.
* **Steps:**
  1. Open each route.
  2. Read `document.title`.
* **Expected result:** The titles differ between pages and name the page.
* **Current behaviour:** "Petclinic Test" on every page.

---

## Owners (OWN)

### OWN-001 – Owner list shows all owners with the expected columns
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Owners → Search.
* **Expected result:**
  * The table columns are Name, Address, City, Telephone, Pets.
  * The number of rows equals the number of owners returned by `GET /owners`.
  * An **Add Owner** button is shown.

### OWN-002 – Search by full last name finds only matching owners
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** Two owners created via API: last names `Qa<u>` and `Qb<u>`.
* **Test data:** Search `Qa<u>`.
* **Steps:**
  1. Owners → Search.
  2. Type the last name and click **Find Owner**.
* **Expected result:** Only the `Qa<u>` owner is listed.

### OWN-003 – Search is case-insensitive
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Owner with last name `Qa<u>` (API).
* **Test data:** Search `qa<u>` (all lower case).
* **Steps:**
  1. Search as in OWN-002.
* **Expected result:** The owner is listed.

### OWN-004 – Search matches the start of the last name
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Owner with last name `Qa<u>` (API).
* **Test data:**
  * `Qa` + the first 4 letters of `<u>` (should match).
  * The last 4 letters of `<u>` (should not match).
* **Steps:**
  1. Search with each value.
* **Expected result:**
  * The prefix finds the owner.
  * A text from the middle or end of the name does not.

### OWN-005 – Search with no match shows a message
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** `Zz<u>`
* **Steps:**
  1. Search with the value.
* **Expected result:** No table rows; the text `No owners with LastName starting with "Zz<u>"` is shown.

### OWN-006 – Search with surrounding spaces
**Priority:** Low · **Status:** Exploratory (automated, records the result) · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** Owner with last name `Qa<u>` (API).
* **Test data:** ` Qa<u> ` (leading and trailing space).
* **Steps:**
  1. Search with the value.
* **Expected result:** Record the behaviour. Currently no owner is found and the message is shown. Whether spaces should be trimmed is an open requirement question.

### OWN-007 – Empty search lists all owners
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @regression

* **Preconditions:** –
* **Test data:** Empty search field.
* **Steps:**
  1. Owners → Search.
  2. Search for an owner so the list is filtered.
  3. Clear the field and click **Find Owner**.
* **Expected result:** All owners are listed again (same count as `GET /owners`).

### OWN-008 – Create an owner with valid data
**Priority:** Critical · **Status:** Automated · **Basis:** Consistency · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** Standard owner.
* **Steps:**
  1. Owners → Add New.
  2. Fill all five fields.
  3. Click **Add Owner**.
  4. Search for the last name.
  5. Open the owner.
* **Expected result:**
  * The owner is listed in the search.
  * "Owner Information" shows exactly the entered name, address, city and telephone.
* **Cleanup:** Delete the owner via API by ID.

### OWN-009 – Add Owner stays disabled until the form is valid
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** Standard owner.
* **Steps:**
  1. Owners → Add New.
  2. Fill the fields one at a time, checking the button after each.
* **Expected result:** **Add Owner** is disabled while any field is empty and enabled once all five are valid.

### OWN-010 – Required-field messages on New Owner
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Owners → Add New.
  2. Focus and leave (or type and clear) each field.
* **Expected result:**
  * The messages "First name is required", "Last name is required", "Address is required", "City is required" and "Phone number is required" are shown.
  * **Add Owner** is disabled.

### OWN-011 – First name minimum length (boundary)
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** First name `A` (1 char), `Ab` (2), `Abc` (3); other fields standard.
* **Steps:**
  1. On New Owner, enter each first name.
* **Expected result:**
  * `A` shows "First name must be at least 2 characters long" and **Add Owner** is disabled.
  * `Ab` and `Abc` show no message and the button is enabled.

### OWN-012 – Telephone rejects non-digits
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** `abc`, `+40-721`, `608 555 00`
* **Steps:**
  1. On New Owner (other fields valid), enter each telephone.
* **Expected result:** "Phone number only accept digits" is shown and **Add Owner** is disabled.

### OWN-013 – Telephone maximum length (boundary)
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** 9 digits `608555000`, 10 digits `6085550000`, 11 digits `60855500001`.
* **Steps:**
  1. Type each value into Telephone.
* **Expected result:**
  * 9 and 10 digits are kept as typed with no message.
  * 11 digits are cut to the first 10 (`6085550000`).

### OWN-014 – Telephone with very few digits
**Priority:** Low · **Status:** Exploratory (automated, records the result) · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** `123`
* **Steps:**
  1. Create an owner with this telephone.
* **Expected result:** Record the behaviour. Currently the value is accepted and saved. A minimum length is an open requirement question (BUG-REPORTS observation).
* **Cleanup:** Delete the owner via API.

### OWN-015 – Owner details show pets and visits
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** Owner with one pet and one visit (API).
* **Test data:** Standard owner, pet, visit.
* **Steps:**
  1. Open `/owners/{id}`.
* **Expected result:**
  * Headings "Owner Information" and "Pets and Visits" are shown.
  * The owner fields match the data.
  * The pet is listed with name, birth date and type.
  * The visit table (Visit Date, Description, Actions) shows `2024-03-10` and the description.
  * The buttons Back, Edit Owner, Add New Pet, Edit Pet, Delete Pet, Add Visit, Edit Visit and Delete Visit are present.

### OWN-016 – Edit an owner
**Priority:** High · **Status:** Automated · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:** Owner (API).
* **Test data:** New values: First `Qe<u>`, Last `Qe<u>`, Address `2 Edit Ave`, City `Editville`, Telephone `6085551111`.
* **Steps:**
  1. Open the owner and click **Edit Owner**.
  2. Wait for the form (heading "Edit Owner") to be filled.
  3. Replace all fields and click **Update Owner**.
* **Expected result:**
  * "Owner Information" shows the new values.
  * `GET /owners/{id}` returns the new values.

### OWN-017 – Edit Owner validation
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** Owner (API).
* **Test data:** –
* **Steps:**
  1. Open **Edit Owner**.
  2. Clear every field.
* **Expected result:**
  * The same five "… is required" messages as OWN-010 are shown.
  * **Update Owner** is disabled.
  * No request is sent.

### OWN-018 – Back on Edit Owner discards changes
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Owner (API).
* **Test data:** City `Changed<u>`
* **Steps:**
  1. Open **Edit Owner** and change City.
  2. Click **Back**.
* **Expected result:**
  * URL is `/owners/{id}`.
  * The City is unchanged in the UI and in `GET /owners/{id}`.

### OWN-019 – Back on New Owner creates nothing
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @regression

* **Preconditions:** –
* **Test data:** Standard owner.
* **Steps:**
  1. Owners → Add New.
  2. Fill the form.
  3. Click **Back**.
* **Expected result:**
  * URL is `/owners` (the owner list).
  * `GET /owners?lastName=Qa<u>` returns no owner.

### OWN-020 – Non-existent owner ID shows an error
**Priority:** Medium · **Status:** Automated – known bug **BUG-002** · **Basis:** Consistency · **Tags:** @negative

* **Preconditions:** –
* **Test data:** `/owners/999999999`
* **Steps:**
  1. Open the URL.
* **Expected result:** A "not found" message (or a redirect); no **Edit Owner** or **Add New Pet** for the missing owner.
* **Current behaviour:** A blank owner page with both buttons; the API's 404 is ignored.

### OWN-021 – Special characters, Unicode and long values in owner fields
**Priority:** Medium · **Status:** Automated (rows 1–4: known bug **BUG-010**) · **Basis:** Consistency · **Tags:** @negative

* **Preconditions:** –
* **Test data:** Each row is one owner and one test. Fields not listed use the standard owner values.

  | Row | Variant | Value | Status |
  |---|---|---|---|
  | 1 | Accented first name | First Name `José` | known bug BUG-010 |
  | 2 | Apostrophe in last name | Last Name `O'BrienQa<u>` | known bug BUG-010 |
  | 3 | Hyphenated last name | Last Name `Smith-Qa<u>` | known bug BUG-010 |
  | 4 | Unicode letters in last name | Last Name `MüllerQa<u>` | known bug BUG-010 |
  | 5 | Unicode address and city | Address `Straße 5`, City `Łódź` | Automated |
  | 6 | Long address | Address 255 × `a` | Automated |
* **Steps:**
  1. Create each owner via the UI.
  2. Open the details page.
* **Expected result:**
  * Each value is saved and displayed exactly as entered.
  * If a value is rejected, a visible message explains why.
  * The request never fails silently.
* **Current behaviour (rows 1–4):** `POST /owners` → 400 with an empty body; the form stays open with no message (BUG-010).
* **Cleanup:** API delete.

---

## Pets (PET)

### PET-001 – Add a pet to an owner
**Priority:** Critical · **Status:** Automated · **Basis:** Consistency · **Tags:** @smoke

* **Preconditions:** Owner (API).
* **Test data:** Standard pet.
* **Steps:**
  1. Open the owner and click **Add New Pet**.
  2. Enter Name, pick the birth date in the calendar, and select Type `dog`.
  3. Click **Save Pet**.
* **Expected result:**
  * The owner page lists the pet with name `Rex<u>`, birth date 2020-01-15 and type `dog`.
  * `POST /owners/{id}/pets` returns 201.

### PET-002 – Add Pet form shows the owner
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Owner (API).
* **Test data:** –
* **Steps:**
  1. Open **Add New Pet**.
* **Expected result:**
  * Heading "Add Pet".
  * The Owner field shows "`<first> <last>`" and is read-only.

### PET-003 – Type dropdown lists all pet types
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Owner and pet type `QaType<u>` (API).
* **Test data:** –
* **Steps:**
  1. Open **Add New Pet**.
  2. Open the Type dropdown.
* **Expected result:** The options equal the names from `GET /pettypes`, including `QaType<u>`.

### PET-004 – Required-field messages on Add Pet
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** Owner (API).
* **Test data:** –
* **Steps:**
  1. Open **Add New Pet**.
  2. Focus and leave Name and Birth Date.
* **Expected result:** "Name is required" and "BirthDate is required" are shown.

### PET-005 – Save Pet on an empty form gives feedback
**Priority:** Low · **Status:** Automated – known bug **BUG-005** · **Basis:** Consistency (Add Owner) · **Tags:** @negative

* **Preconditions:** Owner (API).
* **Test data:** –
* **Steps:**
  1. Open **Add New Pet**.
  2. Click **Save Pet** without filling anything.
* **Expected result:** The button is disabled, or validation messages appear. No request is sent in either case.
* **Current behaviour:** The button is enabled; nothing happens.

### PET-006 – Birth date entered by typing
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @regression

* **Preconditions:** Owner (API).
* **Test data:** Typed `2020/01/15` (the format the Edit Pet form displays).
* **Steps:**
  1. Add a pet, typing the birth date instead of using the calendar.
* **Expected result:**
  * The pet is saved with birth date 2020-01-15 and shown as `2020-01-15` on the owner page.
* **Automation note:** Save is clicked only after the Owner field is filled. Submitting earlier sends `POST owners/undefined/pets` – seen once in Phase 4 when a script clicked before the page had loaded; not reproducible by a person at normal speed, so not filed.

### PET-007 – Birth date in the future
**Priority:** Low · **Status:** Exploratory (automated, records the result) · **Basis:** – · **Tags:** @negative

* **Preconditions:** Owner (API).
* **Test data:** Tomorrow's date.
* **Steps:**
  1. Add a pet with this birth date.
* **Expected result:** Record whether the date is accepted. No requirement exists for this.
* **Cleanup:** API delete.

### PET-008 – Edit a pet
**Priority:** High · **Status:** Automated · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:** Owner with a pet (API).
* **Test data:** Name `Max<u>`, Birth Date 2019/06/01, Type `cat`.
* **Steps:**
  1. Owner page → **Edit Pet**.
  2. Wait for the form (heading "Pet") to fill.
  3. Change all three fields.
  4. Click **Update Pet**.
* **Expected result:**
  * The owner page shows the new name, date and type.
  * `GET /pets/{id}` matches.

### PET-009 – Edit Pet form is pre-filled
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Owner with a pet (API).
* **Test data:** Standard pet.
* **Steps:**
  1. Open **Edit Pet** and wait for the spinner to disappear.
* **Expected result:** The fields show these values:
  * Owner: "`<first> <last>`"
  * Name: `Rex<u>`
  * Birth Date: `2020/01/15`
  * Type: `dog`

### PET-010 – Back on Edit Pet returns to the owner
**Priority:** Medium · **Status:** Automated – known bug **BUG-001** · **Basis:** Consistency (Back on other forms) · **Tags:** @regression

* **Preconditions:** Owner with a pet (API).
* **Test data:** –
* **Steps:**
  1. Open **Edit Pet** and wait for the form.
  2. Click **< Back**.
* **Expected result:** URL is `/owners/{ownerId}`.
* **Current behaviour:** Stays on `/pets/{id}/edit`.

### PET-011 – Back on Add Pet creates nothing
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @regression

* **Preconditions:** Owner (API).
* **Test data:** Standard pet.
* **Steps:**
  1. Open **Add New Pet**.
  2. Fill the form.
  3. Click **< Back**.
* **Expected result:**
  * URL is `/owners/{ownerId}`.
  * The owner has no pets (`GET /owners/{id}`).

### PET-012 – Delete a pet
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Owner with a pet (API).
* **Test data:** –
* **Steps:**
  1. Owner page → **Delete Pet**.
* **Expected result:**
  * The pet disappears from the owner page.
  * `GET /pets/{id}` no longer returns it.

### PET-013 – Deleting a pet asks for confirmation
**Priority:** Medium · **Status:** Automated – known bug **BUG-004** · **Basis:** Consistency (pet type delete) · **Tags:** @regression

* **Preconditions:** Owner with a pet (API).
* **Test data:** –
* **Steps:**
  1. Click **Delete Pet**.
  2. Dismiss the confirmation.
* **Expected result:** A confirmation dialog appears; after dismissing it the pet is still there.
* **Current behaviour:** Deleted immediately.

### PET-014 – Delete a pet that has visits
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @regression

* **Preconditions:** Owner with a pet that has one visit (API).
* **Test data:** –
* **Steps:**
  1. Click **Delete Pet**.
* **Expected result:**
  * The pet and its visit disappear from the owner page.
  * The owner page still loads.
  * `GET /visits/{id}` returns 404 (the visits are deleted with the pet – confirmed in Phase 4).

---

## Visits (VIS)

### VIS-001 – Add a visit
**Priority:** Critical · **Status:** Automated · **Basis:** Consistency · **Tags:** @smoke

* **Preconditions:** Owner with a pet (API).
* **Test data:** Standard visit.
* **Steps:**
  1. Owner page → **Add Visit** for the pet.
  2. Pick the date, enter the description.
  3. Click **Add Visit**.
* **Expected result:** The owner page shows the visit under the pet with date `2024-03-10` and the description.

### VIS-002 – New Visit page shows the pet
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Owner with a pet (API).
* **Test data:** Standard pet.
* **Steps:**
  1. Open **Add Visit**.
* **Expected result:**
  * Heading "New Visit".
  * The pet table (Name, Birth Date, Type, Owner) shows the pet and its owner.

### VIS-003 – New Visit page lists previous visits
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Pet with one visit (API).
* **Test data:** Standard visit.
* **Steps:**
  1. Open **Add Visit** for the pet.
* **Expected result:** "Previous Visits" table (Visit Date, Description, Actions) lists the existing visit.

### VIS-004 – Description is required
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** Owner with a pet (API).
* **Test data:** –
* **Steps:**
  1. Open **Add Visit**.
  2. Focus and leave Description.
* **Expected result:** "Description is required" is shown.

### VIS-005 – Empty New Visit form is not submitted
**Priority:** Medium · **Status:** Automated – known bug **BUG-003** · **Basis:** Consistency · **Tags:** @negative

* **Preconditions:** Owner with a pet (API).
* **Test data:** –
* **Steps:**
  1. Open **Add Visit**.
  2. Click **Add Visit** without filling anything.
* **Expected result:**
  * No request is sent.
  * Required messages are shown for Date and Description.
* **Current behaviour:** `POST …/visits` with `"date":"Invalid date"` → 400, and no error is shown.

### VIS-006 – Date given, description empty
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @negative

* **Preconditions:** Owner with a pet (API).
* **Test data:** Date 2024-03-10, empty description.
* **Steps:**
  1. Fill only the date.
  2. Click **Add Visit**.
* **Expected result:**
  * The form stays open (`/pets/{petId}/visits/add`).
  * No visit is created.
* **Observed in Phase 4:** no request is sent and no message is shown while Description was never touched.

### VIS-007 – Edit a visit
**Priority:** High · **Status:** Automated · **Basis:** Consistency; form details Observed (Phase 4) · **Tags:** @regression

* **Preconditions:** Pet with a visit (API).
* **Test data:** Date 2024-04-20, Description `Edited <u>`.
* **Steps:**
  1. Owner page → **Edit Visit** (heading "Edit Visit"; the form shows the pet table and the current date as `2024/03/10`).
  2. Change date and description.
  3. Click **Update Visit**.
* **Expected result:**
  * The owner page shows the new values.
  * `GET /visits/{id}` matches.

### VIS-008 – Delete a visit
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Pet with a visit (API).
* **Test data:** –
* **Steps:**
  1. Owner page → **Delete Visit**.
* **Expected result:**
  * The visit disappears from the owner page.
  * `GET /visits/{id}` no longer returns it.
  * The pet remains.

### VIS-009 – Deleting a visit asks for confirmation
**Priority:** Medium · **Status:** Automated – known bug **BUG-004** · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:** Pet with a visit (API).
* **Test data:** –
* **Steps:**
  1. Click **Delete Visit**.
  2. Dismiss the confirmation.
* **Expected result:** A dialog appears; the visit is kept.
* **Current behaviour:** Deleted immediately.

### VIS-010 – Back on New Visit returns to the owner
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Owner with a pet (API).
* **Test data:** Description `Unsaved <u>`.
* **Steps:**
  1. Open **Add Visit**.
  2. Type a description.
  3. Click **Back**.
* **Expected result:**
  * URL is `/owners/{ownerId}`.
  * No visit was created.

### VIS-011 – Visit date edge values
**Priority:** Low · **Status:** Exploratory (automated, records the result) · **Basis:** – · **Tags:** @negative

* **Preconditions:** Owner with a pet (API).
* **Test data:** Today, tomorrow, 2024-02-29 (leap day), a date before the pet's birth date.
* **Steps:**
  1. Add a visit with each date.
* **Expected result:**
  * Record which dates are accepted.
  * Accepted dates are displayed unchanged (consistency).
* **Cleanup:** API delete.

---

## Veterinarians (VET)

### VET-001 – Vet list shows names and specialties
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Veterinarians → All.
* **Expected result:**
  * Heading "Veterinarians".
  * Columns are Name and Specialties.
  * Each row has **Edit Vet** and **Delete Vet**.
  * The page has **Home** and **Add Vet** buttons.
  * The rows match `GET /vets` (names and specialty names).

### VET-002 – Create a vet with a specialty
**Priority:** High · **Status:** Automated · **Basis:** Consistency · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** First `Qa<u>`, Last `Qa<u>`, Type `radiology`.
* **Steps:**
  1. Veterinarians → Add New.
  2. Fill the fields.
  3. Click **Save Vet**.
* **Expected result:** The vet list shows "`Qa<u> Qa<u>`" with specialty `radiology`.
* **Cleanup:** API delete.

### VET-003 – Create a vet without a specialty
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (field not required) · **Tags:** @regression

* **Preconditions:** –
* **Test data:** First `Qa<u>`, Last `Qa<u>`, no Type.
* **Steps:**
  1. Create the vet.
* **Expected result:** The vet is listed with an empty Specialties cell (as seed vet James Carter).
* **Cleanup:** API delete.

### VET-004 – Required-field messages on New Veterinarian
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Veterinarians → Add New.
  2. Focus and leave both name fields.
* **Expected result:** "First name is required" and "Last name is required" are shown.

### VET-005 – Save Vet on an empty form gives feedback
**Priority:** Low · **Status:** Automated – known bug **BUG-005** · **Basis:** Consistency (Edit Vet) · **Tags:** @negative

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Veterinarians → Add New.
  2. Click **Save Vet**.
* **Expected result:** The button is disabled, or validation messages appear. No request is sent in either case.
* **Current behaviour:** The button is enabled; nothing happens.

### VET-006 – New Veterinarian specialty field matches Edit Vet
**Priority:** Low · **Status:** Automated – known bug **BUG-006** · **Basis:** Consistency (Edit Vet) · **Tags:** @regression

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Veterinarians → Add New.
  2. Inspect the specialty field.
* **Expected result:** It is labelled "Specialties" and allows several values.
* **Current behaviour:** It is labelled "Type" and is a single select.

### VET-007 – Edit a vet's names and specialties
**Priority:** High · **Status:** Automated · **Basis:** Observed (multi-select) · **Tags:** @regression

* **Preconditions:** Vet with no specialty (API).
* **Test data:** First `Qe<u>`, Last `Qe<u>`, Specialties `radiology` + `surgery`.
* **Steps:**
  1. Vet list → **Edit Vet** for the vet.
  2. Change the names and select both specialties.
  3. Click **Save Vet**.
* **Expected result:**
  * The list shows the new name with both specialties.
  * `GET /vets/{id}` matches.

### VET-008 – Edit Vet validation
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** Vet (API).
* **Test data:** –
* **Steps:**
  1. Open **Edit Vet**.
  2. Clear both name fields.
* **Expected result:**
  * "First name is required" and "Last name is required" are shown.
  * **Save Vet** is disabled.

### VET-009 – Delete a vet
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Vet (API).
* **Test data:** –
* **Steps:**
  1. Vet list → **Delete Vet** for the vet.
* **Expected result:**
  * The vet disappears from the list.
  * `GET /vets/{id}` no longer returns it.

### VET-010 – Deleting a vet asks for confirmation
**Priority:** Medium · **Status:** Automated – known bug **BUG-004** · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:** Vet (API).
* **Test data:** –
* **Steps:**
  1. Click **Delete Vet**.
  2. Dismiss the confirmation.
* **Expected result:** A dialog appears; the vet is kept.
* **Current behaviour:** Deleted immediately.

### VET-011 – Back on Edit Vet discards changes
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @regression

* **Preconditions:** Vet (API).
* **Test data:** First `Changed<u>`
* **Steps:**
  1. Open **Edit Vet** (heading "Edit Veterinarian").
  2. Change the first name.
  3. Click **< Back**.
* **Expected result:**
  * URL is `/vets`.
  * The name is unchanged in the list and API.

---

## Pet Types (PTY)

### PTY-001 – Pet type list
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Open Pet Types.
* **Expected result:**
  * Heading "Pet Types" and a Name column.
  * Each row has **Edit** and **Delete**.
  * The page has **Home** and **Add** buttons.
  * The rows equal `GET /pettypes` names.

### PTY-002 – Add a pet type
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** `QaType<u>`
* **Steps:**
  1. Click **Add**. The form "New Pet Type" opens inline.
  2. Enter the name and click **Save**.
* **Expected result:**
  * The new type is listed.
  * `POST /pettypes` returns 201.
* **Cleanup:** API delete.

### PTY-003 – Pet type name is required on Add
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** Empty name.
* **Steps:**
  1. Click **Add**.
  2. Focus and leave Name.
  3. Click **Save**.
* **Expected result:**
  * "Name is required" is shown.
  * No row is added and `GET /pettypes` is unchanged.

### PTY-004 – Rename a pet type and rename it back (course assignment)
**Priority:** High · **Status:** Automated (course assignment) – `tests/input-fields.spec.ts` · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Pet type `QaType<u>` (API fixture).
* **Test data:** Renamed to `QaRenamed<u>`.
* **Steps:**
  1. Pet Types → **Edit** on the type. Heading "Edit Pet Type" is shown.
  2. Change the name and click **Update**.
  3. Edit it again and restore the original name.
* **Expected result:**
  * After the first update the list shows the new name.
  * After the second update the list shows the original name.
* **Cleanup:** The fixture deletes the type by ID.

### PTY-005 – Cancel on Edit Pet Type keeps the name
**Priority:** Medium · **Status:** Automated · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:** Pet type `QaType<u>` (API).
* **Test data:** `Changed<u>`
* **Steps:**
  1. Click **Edit**.
  2. Change the name.
  3. Click **Cancel**.
* **Expected result:** The list shows the original name; the API is unchanged.

### PTY-006 – Edit Pet Type with an empty name
**Priority:** Medium · **Status:** Exploratory (automated, records the result) · **Basis:** Observed (no message shown) · **Tags:** @negative

* **Preconditions:** Pet type `QaType<u>` (API).
* **Test data:** Empty name.
* **Steps:**
  1. Click **Edit**.
  2. Clear the name.
  3. Click **Update**.
* **Expected result:**
  * Record whether an empty name is saved. Currently no message is shown after clearing.
  * If an empty name is saved, report it as a defect (Add requires a name).
* **Cleanup:** API delete.

### PTY-007 – Delete a pet type after confirming
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Pet type `QaType<u>` (API).
* **Test data:** –
* **Steps:**
  1. Click **Delete** on the type.
  2. Accept "Delete the pet type?".
* **Expected result:**
  * The type disappears.
  * `DELETE /pettypes/{id}` returns 204.

### PTY-008 – Cancel the delete confirmation
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Pet type `QaType<u>` (API).
* **Test data:** –
* **Steps:**
  1. Click **Delete**.
  2. Dismiss the dialog.
* **Expected result:** The type is still listed and still in `GET /pettypes`.
* **Cleanup:** API delete.

### PTY-009 – Duplicate pet type name
**Priority:** Low · **Status:** Exploratory (automated, records the result) · **Basis:** – · **Tags:** @negative

* **Preconditions:** Pet type `QaType<u>` (API).
* **Test data:** Same name `QaType<u>`.
* **Steps:**
  1. Add a second type with the same name.
* **Expected result:** Record whether duplicates are allowed. No requirement exists.
* **Cleanup:** API delete both.

### PTY-010 – Delete a pet type that a pet uses
**Priority:** High · **Status:** Automated – known bug **BUG-009** · **Basis:** Consistency (no record loss without warning) · **Tags:** @regression

* **Preconditions:**
  * Pet type `QaType<u>` (API).
  * Owner with a pet of that type, and one visit for the pet (API).
* **Test data:** –
* **Steps:**
  1. Delete the type in the UI and accept "Delete the pet type?".
  2. Open the owner page.
* **Expected result:**
  * The owner page loads.
  * The pet and its visit still exist (`GET /pets/{id}` and `GET /visits/{id}` → 200) – or the delete is refused / the dialog warns that they will be deleted.
* **Current behaviour:** The pet and its visit are deleted together with the type (both → 404), without warning (BUG-009). Priority raised from Medium to High after this was confirmed.
* **Cleanup:** API delete pet, owner and type.

---

## Specialties (SPC)

### SPC-001 – Specialty list
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Open Specialties.
* **Expected result:**
  * Heading "Specialties".
  * Each row has **Edit** and **Delete**.
  * The page has **Home** and **Add** buttons.
  * The rows equal `GET /specialties` names.

### SPC-002 – Add a specialty
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** `QaSpec<u>`
* **Steps:**
  1. Click **Add**. The form "New Specialty" opens inline.
  2. Enter the name and click **Save**.
* **Expected result:** The specialty is listed.
* **Cleanup:** API delete.

### SPC-003 – Empty specialty name is not saved
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @negative

* **Preconditions:** –
* **Test data:** Empty name.
* **Steps:**
  1. Click **Add**.
  2. Click **Save**.
* **Expected result:**
  * "Name is required" is shown.
  * No row is added.
  * `GET /specialties` is unchanged.
* **Observed in Phase 4:** the form still sends `POST /specialties`, which the API rejects with 400 ([OBS-002](BUG-REPORTS.md#obs-002)). The test records the status.

### SPC-004 – Rename a specialty
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Specialty `QaSpec<u>` (API).
* **Test data:** `QaSpecRenamed<u>`
* **Steps:**
  1. Click **Edit**. Heading "Edit Specialty" is shown.
  2. Change the name and click **Update**.
* **Expected result:** The list shows the new name; the API matches.

### SPC-005 – Cancel on Edit Specialty keeps the name
**Priority:** Medium · **Status:** Automated · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:** Specialty `QaSpec<u>` (API).
* **Test data:** `Changed<u>`
* **Steps:**
  1. Click **Edit**.
  2. Change the name.
  3. Click **Cancel**.
* **Expected result:** The name is unchanged in the list and the API.

### SPC-006 – Delete a specialty
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @regression

* **Preconditions:** Specialty `QaSpec<u>` (API).
* **Test data:** –
* **Steps:**
  1. Click **Delete** on the specialty.
* **Expected result:** It disappears from the list and from `GET /specialties`.

### SPC-007 – Deleting a specialty asks for confirmation
**Priority:** Medium · **Status:** Automated – known bug **BUG-004** · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:** Specialty `QaSpec<u>` (API).
* **Test data:** –
* **Steps:**
  1. Click **Delete**.
  2. Dismiss the confirmation.
* **Expected result:** A dialog appears; the specialty is kept.
* **Current behaviour:** Deleted immediately.

### SPC-008 – Delete a specialty that a vet has
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @regression

* **Preconditions:**
  * Specialty `QaSpec<u>` (API).
  * Vet with that specialty (API).
* **Test data:** –
* **Steps:**
  1. Delete the specialty.
  2. Open the vet list.
* **Expected result:**
  * `DELETE /specialties/{id}` → 204.
  * The vet is still listed and no longer shows the specialty; `GET /vets/{id}` has `specialties: []`.
* **Cleanup:** API delete.

---

## Regression / consistency (REG)

### REG-001 – Renamed pet type appears everywhere
**Priority:** High · **Status:** Automated · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:**
  * Pet type `QaType<u>` (API).
  * Owner with a pet of that type (API).
* **Test data:** `QaRenamed<u>`
* **Steps:**
  1. Rename the type in Pet Types.
  2. Open the owner page.
  3. Open **Edit Pet**.
  4. Open **Add New Pet**.
* **Expected result:**
  * The owner page shows type `QaRenamed<u>`.
  * In both pet forms, the Type field and dropdown show the new name; the old name is gone.

### REG-002 – New specialty is offered in the vet forms
**Priority:** High · **Status:** Automated · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:** Specialty `QaSpec<u>` (API).
* **Test data:** –
* **Steps:**
  1. Open New Veterinarian.
  2. Open Edit Vet for a test-created vet.
* **Expected result:** `QaSpec<u>` is an option in both forms.

### REG-003 – Renamed specialty appears in the vet list
**Priority:** Medium · **Status:** Automated · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:**
  * Specialty `QaSpec<u>` (API).
  * Vet with that specialty (API).
* **Test data:** `QaSpecRenamed<u>`
* **Steps:**
  1. Rename the specialty.
  2. Open Veterinarians → All.
* **Expected result:** The vet's row shows `QaSpecRenamed<u>`.

### REG-004 – Edited owner appears in list and search
**Priority:** High · **Status:** Automated · **Basis:** Consistency · **Tags:** @regression

* **Preconditions:** Owner `Qa<u>` (API).
* **Test data:** New last name `Qe<u>`, new city `Editville`.
* **Steps:**
  1. Edit the owner in the UI.
  2. Search `Qe<u>`.
  3. Search `Qa<u>`.
* **Expected result:**
  * Searching `Qe<u>` finds the owner with city `Editville`.
  * Searching `Qa<u>` no longer finds the owner.

### REG-005 – End-to-end clinic workflow
**Priority:** Critical · **Status:** Automated · **Basis:** Consistency · **Tags:** @smoke

* **Preconditions:** –
* **Test data:** Standard owner, pet and visit.
* **Steps:**
  1. Create the owner in the UI.
  2. Add the pet.
  3. Add the visit.
  4. Edit the visit description.
  5. Delete the visit.
  6. Delete the pet.
* **Expected result:**
  * Each step is reflected on the owner page.
  * At the end the owner has no pets.
* **Cleanup:** API delete owner.

### REG-006 – Data survives a full page reload
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 2 `/seed` check) · **Tags:** @regression

* **Preconditions:** Pet type `QaType<u>` (API).
* **Test data:** –
* **Steps:**
  1. Open Pet Types.
  2. Reload the page (this triggers `POST /seed`).
* **Expected result:**
  * `QaType<u>` is still listed.
  * `POST /seed` returns 201.
* **Cleanup:** API delete.

---

## API (API)

All API cases use the `api` fixture (token sent only to the API host). Response-schema checks cover the fields the client uses; they are confirmed against real responses in Phase 4.

### API-001 – List owners
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @api @smoke

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Send `GET /owners`.
* **Expected result:**
  * 200, JSON array.
  * Each item has `id`, `firstName`, `lastName`, `address`, `city`, `telephone` and `pets` (array).

### API-002 – Search owners by last name
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @api

* **Preconditions:** Owner `Qa<u>` (API).
* **Test data:** `?lastName=Qa<u>`, and the same in lower case.
* **Steps:**
  1. Send `GET /owners?lastName=…`.
* **Expected result:** 200; the array contains only owners whose last name starts with the value, ignoring case.

### API-003 – Owner search without a match (current behaviour: 404)
**Priority:** Low · **Status:** Automated · **Basis:** Observed – **current behaviour, not a requirement** · **Tags:** @api @negative

* **Preconditions:** –
* **Test data:** `?lastName=Zz<u>`
* **Steps:**
  1. Send the request.
* **Expected result:** 404. This is the **current behaviour**; the usual convention would be 200 with an empty list. The difference is logged as low-severity observation [OBS-001](BUG-REPORTS.md#obs-001).
* **Automation note:** The test title says "current behaviour" and the test carries a `current-behaviour` annotation that links to OBS-001. If the API changes to `200 []`, the test fails on purpose, so the observation and this case get updated.

### API-004 – Create, read and delete an owner
**Priority:** High · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @api

* **Preconditions:** –
* **Test data:** Standard owner as JSON.
* **Steps:**
  1. Send `POST /owners`.
  2. Send `GET /owners/{id}`.
  3. Send `DELETE /owners/{id}`.
  4. Send `GET /owners/{id}` again.
* **Expected result:**
  * Create returns 201 and the new `id`.
  * The first GET returns the same values.
  * DELETE returns 204.
  * The final GET returns 404.

### API-005 – Update an owner
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @api

* **Preconditions:** Owner (API).
* **Test data:** City `Editville`.
* **Steps:**
  1. Send `PUT /owners/{id}` with the full owner and the new city.
  2. Send `GET /owners/{id}`.
* **Expected result:** PUT returns 204; GET shows `Editville`.

### API-006 – Unknown owner ID
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @api @negative

* **Preconditions:** –
* **Test data:** `999999999`
* **Steps:**
  1. Send `GET /owners/999999999`.
* **Expected result:** 404.

### API-007 – Create a pet for an owner
**Priority:** High · **Status:** Automated · **Basis:** Observed · **Tags:** @api

* **Preconditions:** Owner (API).
* **Test data:** Standard pet with type `{id, name}` taken from `GET /pettypes`.
* **Steps:**
  1. Send `POST /owners/{id}/pets`.
  2. Send `GET /pets/{petId}`.
* **Expected result:**
  * POST returns 201.
  * GET returns the name, birth date `2020-01-15` and type.

### API-008 – Update and delete a pet
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @api

* **Preconditions:** Owner with a pet (API).
* **Test data:** Name `Max<u>`.
* **Steps:**
  1. Send `PUT /pets/{id}`.
  2. Send `GET /pets/{id}`.
  3. Send `DELETE /pets/{id}`.
  4. Send `GET /pets/{id}` again.
* **Expected result:**
  * PUT returns 204 and the update is visible in the first GET.
  * DELETE returns 204; the final GET returns 404.

### API-009 – Create, update and delete a visit
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @api

* **Preconditions:** Owner with a pet (API).
* **Test data:** Standard visit.
* **Steps:**
  1. Send `POST /owners/{oid}/pets/{pid}/visits`.
  2. Send `PUT /visits/{id}`.
  3. Send `GET /visits/{id}`.
  4. Send `DELETE /visits/{id}`.
* **Expected result:**
  * POST 201, PUT 204, DELETE 204.
  * GET shows the update.
  * After the delete, `GET /visits/{id}` returns 404.

### API-010 – Visit with an invalid date is rejected
**Priority:** Medium · **Status:** Automated · **Basis:** Observed · **Tags:** @api @negative

* **Preconditions:** Owner with a pet (API).
* **Test data:** `"date": "Invalid date"`, description `x`.
* **Steps:**
  1. Send `POST /owners/{oid}/pets/{pid}/visits`.
* **Expected result:** 400; no visit is created.

### API-011 – Pet type CRUD
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (201/204) · **Tags:** @api

* **Preconditions:** –
* **Test data:** `QaType<u>`, then `QaRenamed<u>`.
* **Steps:**
  1. Send `POST /pettypes`.
  2. Send `GET /pettypes/{id}`.
  3. Send `PUT /pettypes/{id}`.
  4. Send `DELETE /pettypes/{id}`.
  5. Send `GET /pettypes/{id}`.
* **Expected result:**
  * POST returns 201.
  * GET returns the name.
  * PUT changes the name.
  * DELETE returns 204.
  * The final GET returns 404.

### API-012 – Specialty CRUD
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @api

* **Preconditions:** –
* **Test data:** `QaSpec<u>`, then `QaSpecRenamed<u>`.
* **Steps:** Same sequence as API-011, on `/specialties`.
* **Expected result:** Same status codes as API-011 (201, 200, 204, 204, 404).

### API-013 – Vet CRUD with specialties
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @api

* **Preconditions:** –
* **Test data:** Vet `Qa<u>` with specialty `radiology`.
* **Steps:**
  1. Send `POST /vets`.
  2. Send `GET /vets/{id}`.
  3. Send `PUT /vets/{id}` adding `surgery`.
  4. Send `DELETE /vets/{id}`.
* **Expected result:**
  * POST 201; GET shows the specialties.
  * PUT 204 adds `surgery`.
  * DELETE 204; afterwards GET returns 404.

### API-014 – Missing required fields are rejected
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4) · **Tags:** @api @negative

* **Preconditions:** –
* **Test data:**
  * `POST /owners` without `lastName`.
  * `POST /pettypes` with `{}`.
  * `POST /vets` without `firstName`.
* **Steps:**
  1. Send each request.
* **Expected result:**
  * 400 for each request (empty body).
  * No record is created; anything created by mistake is deleted.

### API-015 – Requests without a token are rejected
**Priority:** High · **Status:** Automated · **Basis:** Observed (401) · **Tags:** @api @security

* **Preconditions:** A request context **without** an Authorization header.
* **Test data:** `GET /owners`, `/pets`, `/visits`, `/vets`, `/pettypes`, `/specialties`.
* **Steps:**
  1. Send each GET.
* **Expected result:** 401 for every request; no data in the body.

### API-016 – Requests with an invalid token are rejected
**Priority:** High · **Status:** Automated · **Basis:** Observed (401) · **Tags:** @api @security

* **Preconditions:** Context with `Authorization: Bearer invalid-token`.
* **Test data:** Same endpoints as API-015.
* **Steps:**
  1. Send each GET.
* **Expected result:** 401 for every request.

### API-017 – UI and API show the same data
**Priority:** Medium · **Status:** Automated · **Basis:** Consistency · **Tags:** @api @regression

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Read the owner, vet, pet type and specialty lists in the UI.
  2. Read the same lists from the API.
* **Expected result:** Names and counts match for each list.

### API-018 – Response times are reasonable
**Priority:** Low · **Status:** Automated · **Basis:** – (soft check) · **Tags:** @api

* **Preconditions:** –
* **Test data:** `GET /owners`, `/vets`, `/pettypes`.
* **Steps:**
  1. Time each request once.
* **Expected result:** Each request answers within the threshold. This is a single-request sanity check, **not** a load test (load testing is out of scope).
* **Automation note:**
  * The threshold is read from the env var `API_RESPONSE_THRESHOLD_MS` (default `5000`).
  * The check uses `expect.soft`, so a slow response is reported in the results but does not stop the test or the run on its own.

---

## Security (SEC)

All security tests are non-invasive: they use only test-created records and never send attack traffic.

### SEC-001 – Script-like input in owner fields is shown as text
**Priority:** High · **Status:** Automated · **Basis:** Observed (search) · **Tags:** @security

* **Preconditions:** –
* **Test data:** Name fields accept plain letters only (BUG-010), so the payloads go into the free-text fields and the search box:
  * Address `"><script>alert(1)</script>`
  * City `<img src=x onerror=alert(1)>`
  * Search text `<b>x</b>`
* **Steps:**
  1. Create the owner (API).
  2. Open the search results and the details page; search for `<b>x</b>`.
* **Expected result:**
  * The text is displayed literally.
  * No dialog opens.
  * No `<img>`, `<b>` or `<script>` element is created from the input.
* **Cleanup:** API delete.

### SEC-002 – Script-like input in names of other entities
**Priority:** Medium · **Status:** Automated · **Basis:** Consistency · **Tags:** @security

* **Preconditions:** –
* **Test data:**
  * Pet type `Qa<u><img src=x onerror=alert(1)>`
  * Specialty with the same pattern
  * Visit description with the same pattern
* **Steps:**
  1. Create each record.
  2. View it in every place it is shown.
* **Expected result:** The same checks as SEC-001.
* **Cleanup:** API delete.

### SEC-003 – Access token is sent only to the API
**Priority:** High · **Status:** Automated · **Basis:** Observed (verified in Phase 2) · **Tags:** @security

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Record all browser requests while visiting every main page.
* **Expected result:** No request to a host other than `petclinic-api.bondaracademy.com` carries an `Authorization` header.

### SEC-004 – API errors do not leak internal details
**Priority:** Medium · **Status:** Automated – known bug **BUG-008** · **Basis:** Consistency · **Tags:** @security @api

* **Preconditions:** –
* **Test data:** Responses from API-006, API-010, API-014 and API-015.
* **Steps:**
  1. Read each error body.
* **Expected result:** No stack trace, SQL, file path or framework class names in the body.

### SEC-005 – No credentials or tokens in the repository or reports
**Priority:** Medium · **Status:** Manual · **Basis:** Consistency (project rule) · **Tags:** @security

* **Preconditions:** A test run has finished.
* **Test data:** –
* **Steps:**
  1. Check `git status` and the tracked files.
  2. Search the HTML report, traces and `docs/` for the token, the password and `Bearer`.
* **Expected result:**
  * `.env` and `.auth/user.json` are untracked.
  * No secret appears in tracked files or published reports.

---

## Accessibility (A11Y)

### A11Y-001 – Automated axe scan of every main page
**Priority:** Medium · **Status:** Automated – known bug **BUG-011**, **BUG-012**, **BUG-014**, **BUG-016** · **Basis:** Consistency (WCAG 2.x A/AA) · **Tags:** @a11y

* **Preconditions:** –
* **Test data:** Pages from NAV-005, plus the owner details, Add Pet and New Visit pages of a test-created owner.
* **Steps:**
  1. Wait until loading has finished (network idle, loading spinner gone).
  2. Run `@axe-core/playwright` with tags `wcag2a`, `wcag2aa`, `wcag21a` and `wcag21aa` on each page.
* **Expected result:**
  * No violations.
  * Each violation is triaged; confirmed ones are reported in BUG-REPORTS with the rule ID.
* **Automation (Phase 6):**
  * Each page lists the axe rules with a filed bug:
    * `link-name` → BUG-011 (all pages)
    * `label` → BUG-012 (Owners, Pet Types, Specialties, Add Pet, New Visit)
    * `definition-list` → BUG-014 (owner details)
    * `color-contrast` → BUG-016 (Owners)
  * A violation of **any other rule fails normally**, so a new issue is not hidden by `test.fail()`.
  * The known rules are then checked as known bugs.
  * Scanning before loading finished made the result change between runs: the spinner was flagged on some runs, and the list rows were not scanned yet. That spinner violation is filed as BUG-015 and tested by A11Y-007.

### A11Y-002 – Navbar works with the keyboard only
**Priority:** Medium · **Status:** Automated – known bug **BUG-013** · **Basis:** Consistency · **Tags:** @a11y

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. From the top of the page, press Tab until **Owners** has focus.
  2. Open it with Enter.
  3. Tab to **Add New** and press Enter.
  4. Repeat for **Veterinarians**.
* **Expected result:** Each target page opens without using the mouse.
* **Automation (Phase 6):** Menus that cannot be reached with Tab are collected. The known-bug assertion is that this list is empty. A menu that *can* be reached is then opened and checked as a normal test step.

### A11Y-003 – New Owner form can be completed with the keyboard
**Priority:** Medium · **Status:** Automated · **Basis:** Consistency · **Tags:** @a11y

* **Preconditions:** –
* **Test data:** Standard owner.
* **Steps:**
  1. Tab through the fields, typing values.
  2. Press Enter (or Tab to **Add Owner** and press Enter).
* **Expected result:**
  * The focus order follows the visual order.
  * The owner is created.
* **Cleanup:** API delete.

### A11Y-004 – Form fields have accessible names
**Priority:** Medium · **Status:** Automated – known bug **BUG-012** · **Basis:** Observed (several fields have none) · **Tags:** @a11y

* **Preconditions:** –
* **Test data:** Fields seen without a name in Phase 1:
  * the owner search box
  * the Add/Edit Pet Owner and Birth Date fields
  * the New Visit Date and Description fields
  * the inline pet type and specialty Name fields
* **Steps:**
  1. Read each field's accessible name.
* **Expected result:**
  * Every field has an accessible name.
  * Confirmed gaps are filed as a new bug in Phase 6: all 7 fields are filed as **BUG-012**.

### A11Y-005 – Visible focus indicator
**Priority:** Low · **Status:** Manual · **Basis:** Consistency (WCAG 2.4.7) · **Tags:** @a11y

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Tab through the navbar, a form and a table with buttons.
* **Expected result:** The focused element is always visibly marked.

### A11Y-006 – Date picker works with the keyboard
**Priority:** Low · **Status:** Manual · **Basis:** Consistency · **Tags:** @a11y

* **Preconditions:** Owner (API).
* **Test data:** –
* **Steps:**
  1. In Add Pet, open the calendar with the keyboard.
  2. Move to a date with the arrow keys.
  3. Select it with Enter.
* **Expected result:**
  * The date is selected.
  * Focus returns to the form.

### A11Y-007 – Loading indicator has an accessible name
**Priority:** Low · **Status:** Automated – known bug **BUG-015** · **Basis:** Consistency (WCAG 4.1.2) · **Tags:** @a11y
*Added in Phase 6.*

* **Preconditions:** –
* **Test data:** –
* **Steps:**
  1. Hold back the browser's own `GET /pettypes` request (`page.route`), so the loading spinner stays visible. Nothing is sent to the server until the request is released.
  2. Open Pet Types.
  3. Read the spinner's (`role="progressbar"`) accessible name.
  4. Release the request.
* **Expected result:** The spinner has an accessible name (e.g. "Loading").

---

## Responsive / cross-browser (RSP)

### RSP-001 – Mobile navigation menu
**Priority:** Medium · **Status:** Automated · **Basis:** Observed (Phase 4: the navbar does not collapse; all items stay visible at 390–412 px) · **Tags:** @responsive

* **Preconditions:** `mobile` project (Pixel / iPhone viewport).
* **Test data:** –
* **Steps:**
  1. Open `/`.
  2. Open the navigation menu.
  3. Visit each page from NAV-002 – NAV-004.
* **Expected result:**
  * Every page can be reached.
  * No navbar item is cut off or hidden without a way to reach it.

### RSP-002 – No horizontal page scroll on tablet and mobile
**Priority:** Low · **Status:** Automated – known bug **BUG-017** (phones only) · **Basis:** Consistency (WCAG 1.4.10 Reflow) · **Tags:** @responsive

* **Preconditions:** `tablet` and `mobile` projects; an owner with a pet (API).
* **Test data:** Pages from NAV-005, plus the owner details, Add Pet and New Visit pages.
* **Steps:**
  1. Open each page.
  2. Compare the page width with the **device screen width** (`screen.width`). Mobile browsers widen the layout viewport to fit wide content, so comparing with `window.innerWidth` would hide an overflow.
* **Expected result:**
  * No page is wider than the screen.
  * Wide tables may scroll inside their own container. Any page-level overflow is recorded and triaged.
* **Observed in Phase 4:** on `mobile` (Pixel 7, 412 px) the New Visit page is 422 px wide (`.form-group` / `.col-sm-10` and the footer).
* **Phase 6:**
  * Filed as **BUG-017**. It also reproduced on iPhone 14 (WebKit) and Galaxy S9+, and the owner details page overflows on 320 px screens.
  * Only the New Visit overflow on screens narrower than Bootstrap's 768 px breakpoint counts as the known bug. Overflow on any other page, or on the tablet, fails normally.

### RSP-003 – Create an owner on mobile
**Priority:** Medium · **Status:** Automated indirectly (no separate test: OWN-008 is `@smoke` and runs in the `mobile` project) · **Basis:** Consistency · **Tags:** @smoke

* **Preconditions:** `mobile` project.
* **Test data:** Standard owner.
* **Steps:** Same as OWN-008.
* **Expected result:** Same as OWN-008.
* **Cleanup:** API delete.

### RSP-004 – Smoke suite on Firefox, WebKit, tablet and mobile
**Priority:** High · **Status:** Automated indirectly (no separate test: the `firefox`, `webkit`, `tablet` and `mobile` projects run every `@smoke` test) · **Basis:** Consistency · **Tags:** @smoke

* **Preconditions:** `firefox`, `webkit`, `tablet` and `mobile` projects (see `playwright.config.ts`).
* **Test data:** –
* **Steps:**
  1. Run all `@smoke` cases on each project.
* **Expected result:** The results match Chromium; any browser-only failure is triaged.
* **Automation note:** On touch devices the New Visit form is submitted with focus + Enter instead of a pointer click: the form is wider than the screen (RSP-002), the browser pans the view after a field gets focus, and pointer clicks then miss the button. A tap at the visible position works for a person.
