# Bug Reports – PetClinic (petclinic.bondaracademy.com)

| | |
|---|---|
| **Status** | Phase 6 – all bugs re-checked on 2026-11-02 |
| **Related** | [TEST-CASES.md](TEST-CASES.md) · [TEST-COVERAGE.md](TEST-COVERAGE.md) · [TEST-EXECUTION-REPORT.md](TEST-EXECUTION-REPORT.md) |
| **Evidence** | [docs/evidence/](evidence/) |

Every defect below was reproduced on records created for the check (or on read-only pages), and those
records were deleted afterwards. Nothing pre-existing was changed.

**How each bug was confirmed.** Each bug is found by an automated test and was then reproduced
**outside the test suite**. The second check used a separate script that drives the browser
directly, without the Playwright test runner, its fixtures or the page objects. It ran on
2026-11-02 against the live site. That script produced the screenshots and JSON files in
[docs/evidence/](evidence/).

**Environment** (unless a bug says otherwise):
* Chromium (Playwright 1.64.1 bundled build), Windows 11 Pro, viewport 1920×1080.
* Each tester account has its own sandbox dataset ([TEST-DATA.md](TEST-DATA.md)).
* Bugs that depend on the browser or the screen were also checked in Firefox and WebKit, or on phone and tablet emulation.

**Traces.** In a normal run, Playwright counts a known-bug test (`test.fail()`) as passed, so `retain-on-failure` keeps only its `error-context.md` and no trace or video. To get a trace of every known bug, run the suite with `VERIFY_KNOWN_BUGS=1`. The known-bug tests then fail normally and keep their traces in `test-results/`. Open one with `npx playwright show-trace <path>`. Traces are **not** committed: they contain the session's access token in request headers and local storage. The screenshots and JSON files in [docs/evidence/](evidence/) are the committed evidence.

## Summary

| ID | Title | Severity | Priority | Confirmed in | Test(s) |
|---|---|---|---|---|---|
| [BUG-001](#bug-001) | "< Back" on Edit Pet page does nothing | Medium | Medium | Chromium, Firefox, WebKit | PET-010 |
| [BUG-002](#bug-002) | Non-existent owner ID shows an empty owner page without an error | Medium | Low | Chromium | OWN-020 |
| [BUG-003](#bug-003) | Submitting an empty New Visit form sends an invalid request and fails silently | Medium | Medium | Chromium, Firefox, WebKit | VIS-005 |
| [BUG-004](#bug-004) | Visits, pets, vets and specialties are deleted without confirmation | Medium | Medium | Chromium | PET-013, VIS-009, VET-010, SPC-007 |
| [BUG-005](#bug-005) | Save Pet / Save Vet are enabled on an empty form and submit it anyway | Low | Low | Chromium | PET-005, VET-005 |
| [BUG-006](#bug-006) | New Veterinarian form labels the specialty field "Type" and allows only one | Low | Low | Chromium | VET-006 |
| [BUG-007](#bug-007) | Every page has the same document title | Low | Low | Chromium | NAV-008 |
| [BUG-008](#bug-008) | API error responses expose Java class names and parser messages | Medium | Low | API | SEC-004 |
| [BUG-009](#bug-009) | Deleting a pet type silently deletes every pet of that type and their visits | **High** | **High** | Chromium + API | PTY-010 |
| [BUG-010](#bug-010) | Owners with accented, hyphenated or apostrophe names cannot be saved; no feedback | Medium | Medium | Chromium + API | OWN-021 (4 rows) |
| [BUG-011](#bug-011) | Logo link in the navigation bar has no accessible name | Low | Medium | Chromium | A11Y-001 |
| [BUG-012](#bug-012) | Form fields have no label or accessible name | Medium | Medium | Chromium | A11Y-001, A11Y-004 |
| [BUG-013](#bug-013) | Owners and Veterinarians menus cannot be reached with the keyboard | **High** | **High** | Chromium, Firefox | A11Y-002 |
| [BUG-014](#bug-014) | Owner details: invalid definition list structure | Low | Low | Chromium | A11Y-001 |
| [BUG-015](#bug-015) | Loading spinner has no accessible name | Low | Low | Chromium | A11Y-007 |
| [BUG-016](#bug-016) | Owner name links in the owner list have too little colour contrast | Low | Low | Chromium | A11Y-001 |
| [BUG-017](#bug-017) | New Visit page is wider than phone screens (horizontal scrolling) | Medium | Medium | Pixel 7 (Chromium), iPhone 14 (WebKit), Galaxy S9+ (Chromium) | RSP-002 (mobile) |

When each bug was found:
* **BUG-001 – BUG-007:** Phase 2.
* **BUG-008 – BUG-010:** Phase 4.
* **BUG-011 – BUG-017:** the Phase 4 accessibility and responsive tests. They were investigated and filed in Phase 6.

The known-bug tests are marked with `test.fail()` and an `issue` annotation that names the bug ID. See [TEST-CASES.md](TEST-CASES.md#legend).

---

## BUG-001

**Title:** "< Back" on the Edit Pet page does nothing

**Description:** On the Edit Pet page, clicking "< Back" leaves the user on the same page.
The only way out is the navigation bar or the browser back button.

**Preconditions:** Logged in; an owner with at least one pet exists.

**Steps to reproduce:**
1. Owners → Search → open any owner (e.g. *Jean Coleman*).
2. Click **Edit Pet** for one of the pets.
3. Wait until the form is filled in (loading spinner gone).
4. Click **< Back**.

**Expected result:** The user returns to the owner's details page (`/owners/{ownerId}`).

**Actual result:** The URL stays `/pets/{petId}/edit` and the form remains displayed. No
network request is made.

**Severity:** Medium. The navigation control is broken, but a workaround exists.
**Priority:** Medium
**Browser / viewport:** Chromium, Firefox and WebKit, each at 1920×1080.
**Reproduced outside the tests:** Yes, on 2026-11-02 in all three browsers. The URL was unchanged 3 s after the click.
**Evidence:** [Chromium](evidence/BUG-001-edit-pet-back.png) · [Firefox](evidence/BUG-001-edit-pet-back-firefox.png) · [WebKit](evidence/BUG-001-edit-pet-back-webkit.png) (each taken 3 s after clicking Back)

---

## BUG-002

**Title:** Non-existent owner ID shows an empty owner page without an error

**Description:** Opening `/owners/{id}` with an ID that does not exist renders the normal
"Owner Information" page with blank values. The API answers 404, but nothing tells the
user the owner does not exist. The **Edit Owner** and **Add New Pet** buttons are still
offered for the non-existent owner.

**Preconditions:** Logged in.

**Steps to reproduce:**
1. Open `https://petclinic.bondaracademy.com/owners/999999999`.

**Expected result:** A "not found" message (or redirect to the owner list); no actions for
a non-existent record.

**Actual result:** A blank owner page with the Edit Owner and Add New Pet buttons.
`GET /petclinic/api/owners/999999999` returns **404**, and the UI ignores it.

**Severity:** Medium. The page is misleading and offers actions on a record that does not exist.
**Priority:** Low. The page can only be reached by editing the URL or following a stale link.
**Browser / viewport:** Chromium 1920×1080
**Reproduced outside the tests:** Yes, on 2026-11-02 (API 404, blank page, 2 action buttons).
**Evidence:** [BUG-002-invalid-owner-id.png](evidence/BUG-002-invalid-owner-id.png)

**Note:** The client's HTTP services replace failed responses with default values
(`handlerError(...)`). That is the likely root cause of this bug and of BUG-003.

---

## BUG-003

**Title:** Submitting an empty New Visit form sends an invalid request and fails silently

**Description:** The **Add Visit** button is enabled while the form is empty. Clicking it
sends a request with `"date":"Invalid date"`, which the API rejects with HTTP 400. The user is not
told that the request failed.

**Preconditions:** Logged in; an owner with a pet exists.

**Steps to reproduce:**
1. Open an owner's details page.
2. Click **Add Visit** for a pet.
3. Leave Date and Description empty and click **Add Visit**.

**Expected result:** The form is not submitted; required-field messages are shown for
Date and Description.

**Actual result:** `POST /petclinic/api/owners/{ownerId}/pets/{petId}/visits` is sent with body
`{"date":"Invalid date", ...}` and returns **400**. The page stays unchanged. No error is shown, and no message appears for the empty Date field.

**Severity:** Medium. Client-side validation is bypassed and an invalid request reaches the API.
**Priority:** Medium
**Browser / viewport:** Chromium, Firefox and WebKit, each at 1920×1080.
**Reproduced outside the tests:** Yes, on 2026-11-02 in all three browsers (POST → 400 each time).
**Evidence:** [Chromium](evidence/BUG-003-empty-add-visit.png) · [Firefox](evidence/BUG-003-empty-add-visit-firefox.png) · [WebKit](evidence/BUG-003-empty-add-visit-webkit.png)

---

## BUG-004

**Title:** Visits, pets, vets and specialties are deleted without confirmation

**Description:** Deleting a **pet type** asks "Delete the pet type?". Deleting a **visit**,
**pet**, **veterinarian** or **specialty** happens immediately on a single click, with no
confirmation and no undo. This is inconsistent within the application, and it makes accidental
data loss easy.

**Preconditions:** Logged in; one record of each kind exists (use test-created records).

**Steps to reproduce:**
1. Owner details page → click **Delete Visit** on a visit.
2. Owner details page → click **Delete Pet** on a pet.
3. Veterinarians → All → click **Delete Vet**.
4. Specialties → click **Delete**.

**Expected result:** A confirmation step, as for pet types.

**Actual result:** No dialog appears, and each record is deleted at once. A `GET` of the record afterwards returns 404.

**Severity:** Medium. A mis-click deletes data permanently.
**Priority:** Medium
**Browser / viewport:** Chromium 1920×1080
**Reproduced outside the tests:** Yes, on 2026-11-02, for all four record types.
**Evidence:** [BUG-004-deletes-without-dialog.json](evidence/BUG-004-deletes-without-dialog.json). It is the record of the browser's dialog listener plus the API status after each delete. A missing dialog cannot be shown in a screenshot.

---

## BUG-005

**Title:** Save Pet / Save Vet are enabled on an empty form and submit it anyway

**Description:** On **Add Pet** and **New Veterinarian**, the submit button is enabled while
the required fields are empty. Clicking it sends the empty form to the API, which rejects it with
**400**:
* **Save Pet** then does nothing visible. No message appears.
* **Save Vet** shows "First name is required" / "Last name is required".

Other forms in the app (Add Owner, Edit Vet) disable the button until the form is valid.

**Preconditions:** Logged in.

**Steps to reproduce:**
1. Owner details → **Add New Pet** → click **Save Pet** without filling anything.
2. Veterinarians → Add New → click **Save Vet** without filling anything.

**Expected result:** The button stays disabled until the form is valid, as on Add Owner. No request is sent.

**Actual result:**
* **Save Pet:** `POST /owners/{id}/pets` → 400. No messages, and the page stays on Add Pet.
* **Save Vet:** `POST /vets` with `{"id":null,"specialties":[]}` → 400. The two "required" messages are shown.

**Severity:** Low. No data is changed, but the user gets no guidance on Add Pet.
**Priority:** Low
**Browser / viewport:** Chromium 1920×1080
**Reproduced outside the tests:** Yes, on 2026-11-02.
**Evidence:** [BUG-005-empty-save-pet.png](evidence/BUG-005-empty-save-pet.png),
[BUG-005-empty-save-vet.png](evidence/BUG-005-empty-save-vet.png)

**Correction (Phase 6):** Phase 2 recorded this as "no request, no messages". The Phase 6 re-check
used a response listener and found that the request **is** sent and rejected with 400, and that
Save Vet does show messages. This is the same gap as [OBS-002](#obs-002): the Phase 2 check did not see the request.
The defect itself, an enabled button that submits an empty form, is confirmed. PET-005 and VET-005
fail on their "no request for an empty form" assertion, so the tests were right.

---

## BUG-006

**Title:** New Veterinarian form labels the specialty field "Type" and allows only one

**Description:** On **New Veterinarian**, the specialty dropdown is labelled "Type" and allows only one value. On **Edit Veterinarian**, the same data is labelled "Specialties" and allows
several values. A new vet with two specialties therefore has to be created and then edited.

**Preconditions:** Logged in.

**Steps to reproduce:**
1. Veterinarians → Add New.
2. Inspect the third field.
3. Compare with Veterinarians → All → Edit Vet.

**Expected result:** Same label ("Specialties") and the same multi-select on both forms.

**Actual result:** The label is "Type", on a single-value `<select>` with radiology / surgery / dentistry.

**Severity:** Low
**Priority:** Low
**Browser / viewport:** Chromium 1920×1080
**Reproduced outside the tests:** Yes, on 2026-11-02.
**Evidence:** [BUG-006-new-vet-type-label.png](evidence/BUG-006-new-vet-type-label.png)

---

## BUG-007

**Title:** Every page has the same document title

**Description:** All checked routes (`/`, `/owners`, `/owners/add`, `/vets`, `/vets/add`,
`/pettypes`, `/specialties`) use the title "Petclinic Test". Browser tabs, history and screen-reader users
cannot tell the pages apart (WCAG 2.2 SC 2.4.2 *Page Titled*).

**Preconditions:** None.

**Steps to reproduce:** Visit several pages and read the browser tab title.

**Expected result:** A descriptive title per page, e.g. "Owners – Petclinic".

**Actual result:** "Petclinic Test" on every page.

**Severity:** Low
**Priority:** Low
**Browser / viewport:** Chromium 1920×1080
**Reproduced outside the tests:** Yes, on 2026-11-02 (7 of 7 routes).
**Evidence:** [BUG-007-page-titles.json](evidence/BUG-007-page-titles.json) (`document.title` per route). The title is not part of a page screenshot.

---

## BUG-008

**Title:** API error responses expose Java class names and parser messages

**Description:** When the API rejects a malformed request, the 400 response body contains
the server-side exception class and the raw parser message, including Java package and DTO
class names. This tells an attacker which framework, library and internal classes are used
(OWASP: improper error handling / information disclosure).

**Preconditions:** Valid API token; an owner with a pet (test-created).

**Steps to reproduce:**
1. `POST /petclinic/api/owners/{ownerId}/pets/{petId}/visits` with body `{"date":"Invalid date","description":"x"}`.
2. Or: `POST /petclinic/api/owners` with the malformed body `{not json`.

**Expected result:** 400 with a generic message (e.g. `{"error":"Invalid date format"}`) and no internal details.

**Actual result:** 400 with:
```json
{
  "className": "org.springframework.http.converter.HttpMessageNotReadableException",
  "exMessage": "JSON parse error: Cannot deserialize value of type `java.time.LocalDate` from String \"Invalid date\": … (java.time.format.DateTimeParseException) …"
}
```
The malformed-JSON case also names `org.springframework.samples.petclinic.rest.dto.OwnerFieldsDto`.

**Severity:** Medium. This is information disclosure; no data is exposed.
**Priority:** Low
**Browser / viewport:** Not applicable (API, Playwright request context).
**Reproduced outside the tests:** Yes, on 2026-11-02 (both requests).
**Evidence:** [BUG-008-api-400-body.json](evidence/BUG-008-api-400-body.json)

---

## BUG-009

**Title:** Deleting a pet type silently deletes every pet of that type and their visits

**Description:** Deleting a pet type that pets still use also removes **those pets and their
visit history**. The confirmation dialog only asks "Delete the pet type?" and does
not mention that patient records will be lost. One mis-click on a lookup value can
delete the clinical history of many owners, and there is no undo.

**Preconditions:** Logged in. A test-created pet type, and a test-created owner with a pet of
that type and one visit.

**Steps to reproduce:**
1. Pet Types → click **Delete** on the pet type.
2. Accept "Delete the pet type?".
3. Open the owner's page.

**Expected result:** Either the delete is refused while pets use the type (with a message), or
the dialog clearly warns that N pets and their visits will also be deleted.

**Actual result:** `DELETE /pettypes/{id}` returns 204. The pet and its visit are deleted too: `GET /pets/{id}` goes from 200 to 404, and so does `GET /visits/{id}`. The pet no longer appears on the owner's page.

**Severity:** High. Clinical records are lost without warning.
**Priority:** High
**Browser / viewport:** Chromium 1920×1080 + API status checks
**Reproduced outside the tests:** Yes, on 2026-11-02 (the third reproduction overall).
**Evidence:** [BUG-009-cascade-delete.json](evidence/BUG-009-cascade-delete.json), which records the dialog text and the statuses before and after.
[BUG-009-owner-after-pet-type-delete.png](evidence/BUG-009-owner-after-pet-type-delete.png) shows the owner's page with the pet gone.
**Note:** No requirement says whether the cascade is intended. If it is, the defect is that the
dialog does not warn about it.

---

## BUG-010

**Title:** Owners with accented, hyphenated or apostrophe names cannot be saved, and the form gives no feedback

**Description:** The New Owner form accepts names such as `José`, `O'Brien`, `Müller` or
`Smith-Jones` and enables **Add Owner**. The API then rejects the request with **400 and an
empty body**, and the form does nothing: no message and no navigation. Unicode in Address and
City is accepted, so only the name fields are affected.

**Preconditions:** Logged in.

**Steps to reproduce:**
1. Owners → Add New.
2. Enter First Name `José`, Last Name `Coleman`, Address `1 Test St`, City `Testville`, Telephone `6085550000`.
3. Click **Add Owner**.

**Expected result:** The owner is saved. If such names are not allowed, the form says so
before submitting.

**Actual result:** `POST /petclinic/api/owners` returns **400** with an empty body. The page stays on New
Owner with no feedback. The same happens for `O'Brien…`, `Müller…` and `Smith-…` last names.

**Severity:** Medium. Common real-world names cannot be registered, and the failure is silent.
**Priority:** Medium
**Browser / viewport:** Chromium 1920×1080
**Reproduced outside the tests:** Yes, on 2026-11-02 (`José` → 400, still on `/owners/add`).
**Evidence:** [BUG-010-accented-name-rejected.png](evidence/BUG-010-accented-name-rejected.png). In Phase 4, UI and direct API calls were also made for 6 name variants.
**Note:** Whether such names must be accepted is a requirement decision. The silent failure is a defect in either case.

---

## BUG-011

**Title:** Logo link in the navigation bar has no accessible name

**Description:** The "Petclinic" logo in the navigation bar is a link to `/welcome`. Its only
content is an empty `<span>` with a background image, so the link has no text and no
`aria-label`. Screen readers announce it as "link" or read out the URL. It appears on every page.

**Preconditions:** None.

**Steps to reproduce:**
1. Open any page.
2. Inspect the logo link: `<a routerlink="/welcome" class="navbar-brand" href="/welcome"><span></span></a>`.
3. Or run axe (rule `link-name`), or check the accessibility tree.

**Expected result:** The link has a name, e.g. `aria-label="Petclinic home"` or visually hidden text.

**Actual result:** The link has no accessible name. axe reports `link-name` (serious) on all 10 screens scanned.

**Severity:** Low. The other navbar links work, and this link only duplicates Home.
**Priority:** Medium. It appears on every page and is a one-line fix.
**Standard:** WCAG 2.2 SC 2.4.4 *Link Purpose* and 4.1.2 *Name, Role, Value* (Level A).
**Browser / viewport:** Chromium 1920×1080. This is a DOM issue and does not depend on the browser.
**Reproduced outside the tests:** Yes, on 2026-11-02 (10 of 10 screens).
**Evidence:** [BUG-011-logo-link-no-name.png](evidence/BUG-011-logo-link-no-name.png) (link outlined in red),
[BUG-011-016-axe-results.json](evidence/BUG-011-016-axe-results.json)

---

## BUG-012

**Title:** Form fields have no label or accessible name

**Description:** Several inputs have a visible caption next to them, but the caption is not linked
to the field (no `<label for>`, `aria-label` or `aria-labelledby`). Screen-reader users hear only "edit text" and cannot tell which field they are in.

| Screen | Fields without a name |
|---|---|
| Owners | Last name search (`#lastName`) |
| Add Pet | Owner (`#owner_name`), Birth Date (date picker input) |
| New Visit | Date (date picker input), Description (`#description`) |
| Pet Types | New pet type name (after **Add**); each row's read-only name field (6 rows) |
| Specialties | New specialty name (after **Add**); each row's read-only name field (3 rows) |

**Preconditions:** Logged in. An owner with a pet exists, for the Add Pet and New Visit screens.

**Steps to reproduce:**
1. Open New Visit for a pet.
2. Check the Date and Description fields in the accessibility tree (or run axe, rule `label`).

**Expected result:** Every field has an accessible name that matches its visible caption.

**Actual result:** The fields above have no accessible name. The accessibility tree shows
`- textbox` with no name, and axe reports `label` (critical).

**Severity:** Medium. Screen-reader users cannot reliably fill in pets, visits or searches.
**Priority:** Medium
**Standard:** WCAG 2.2 SC 1.3.1 *Info and Relationships* and 4.1.2 *Name, Role, Value* (Level A).
**Browser / viewport:** Chromium 1920×1080. This is a DOM issue and does not depend on the browser.
**Reproduced outside the tests:** Yes, on 2026-11-02 (axe on 5 screens; accessibility tree for the Add fields).
**Evidence:** [BUG-012-unlabelled-fields-new-visit.png](evidence/BUG-012-unlabelled-fields-new-visit.png) (fields outlined in red),
[BUG-011-016-axe-results.json](evidence/BUG-011-016-axe-results.json) (rule `label`)

---

## BUG-013

**Title:** Owners and Veterinarians menus cannot be reached with the keyboard

**Description:** The **Owners** and **Veterinarians** menu toggles in the navigation bar are
`<a role="button" data-toggle="dropdown">` elements with **no `href` and no `tabindex`**, so
they cannot receive keyboard focus. Tab moves from **Home** directly to **Pet Types**. The
pages behind these menus (Search owners, Add owner, All vets, Add vet) cannot be reached from
the navigation bar without a mouse.

**Preconditions:** None.

**Steps to reproduce:**
1. Open the home page.
2. Press **Tab** repeatedly and watch the focus.

**Expected result:** Focus reaches **Owners** and **Veterinarians**. Enter opens the menu, and its items can be reached with Tab or the arrow keys.

**Actual result:** The focus order is the logo, **Home**, **Pet Types**, **Specialties**, then out of the page. Owners and Veterinarians are skipped.

**Severity:** High. Keyboard-only users cannot reach the owner and vet features from the navigation.
**Priority:** High
**Standard:** WCAG 2.2 SC 2.1.1 *Keyboard* (Level A).
**Browser / viewport:**
* Chromium 1920×1080 and Firefox 1920×1080: reproduced.
* WebKit could not be checked. Its Tab key does not move to links by default (as in Safari without "Press Tab to highlight each item"), so focus stayed on the page body.
**Reproduced outside the tests:** Yes, on 2026-11-02 in Chromium and Firefox.
**Evidence:** [BUG-013-tab-skips-menus.png](evidence/BUG-013-tab-skips-menus.png) shows the focus on Specialties after 4 presses of Tab.
The focus order is logged in [BUG-013-tab-order.json](evidence/BUG-013-tab-order.json) and the
[Firefox log](evidence/BUG-013-tab-order-firefox.json).

---

## BUG-014

**Title:** Owner details: invalid definition list structure

**Description:** On the owner details page, each pet's details are shown in a `<dl>`. Its "Edit Pet", "Delete Pet" and "Add Visit"
**buttons** sit directly inside the `<dl>`. A `<dl>` may only contain `<dt>`/`<dd>` groups (or
`<div>` wrappers). Assistive technology may then announce the list and its terms incorrectly.

**Preconditions:** Logged in; an owner with a pet.

**Steps to reproduce:**
1. Open the owner details page for an owner with a pet.
2. Run axe (rule `definition-list`), or inspect the pet's `<dl class="dl-horizontal">`.

**Expected result:** The `<dl>` contains only `<dt>`/`<dd>` groups. The buttons are placed outside it.

**Actual result:** axe: "dl element has direct children that are not allowed: button".

**Severity:** Low
**Priority:** Low
**Standard:** WCAG 2.2 SC 1.3.1 *Info and Relationships* (Level A).
**Browser / viewport:** Chromium 1920×1080. This is a DOM issue and does not depend on the browser.
**Reproduced outside the tests:** Yes, on 2026-11-02.
**Evidence:** [BUG-014-owner-details-dl.png](evidence/BUG-014-owner-details-dl.png) (`<dl>` outlined in red),
[BUG-011-016-axe-results.json](evidence/BUG-011-016-axe-results.json) (rule `definition-list`)

---

## BUG-015

**Title:** Loading spinner has no accessible name

**Description:** While data loads, the app shows an Angular Material spinner
(`<mat-spinner role="progressbar">`) over the page. It has no `aria-label`, so screen readers
announce only "progress bar" with no context. It appears on every page that loads data.

**Preconditions:** Logged in. A slow response makes the spinner easy to see.

**Steps to reproduce:**
1. Open Pet Types (or any list) while the list request is still pending.
2. Inspect the spinner in the accessibility tree.

**Expected result:** The spinner has a name such as "Loading".

**Actual result:** The accessibility tree shows `- progressbar` with no name. axe reports `aria-progressbar-name` (serious) whenever it scans during loading.

**Severity:** Low. The spinner is shown only briefly.
**Priority:** Low
**Standard:** WCAG 2.2 SC 4.1.2 *Name, Role, Value* (Level A).
**Browser / viewport:** Chromium 1920×1080
**Reproduced outside the tests:** Yes, on 2026-11-02. The page's own pet type request was held back in the browser so the spinner stayed visible; nothing was changed on the server.
**Evidence:** [BUG-015-spinner-no-name.png](evidence/BUG-015-spinner-no-name.png),
[BUG-015-spinner.json](evidence/BUG-015-spinner.json)

**How this was found:** It first showed up in A11Y-001 as a violation that came and went between runs. The
scan sometimes ran before loading had finished. A11Y-001 now scans after loading, and A11Y-007 checks the
spinner on purpose.

---

## BUG-016

**Title:** Owner name links in the owner list have too little colour contrast

**Description:** In the owner list, the owner names are green links (`#5fa134`) on the light
striped rows (`#f9f9f9`). The contrast ratio is **3.0:1**. WCAG AA requires **4.5:1** for normal-size text (14 px).

**Preconditions:** Logged in.

**Steps to reproduce:**
1. Owners → Search (list all owners).
2. Measure the contrast of an owner name link, or run axe (rule `color-contrast`).

**Expected result:** A contrast of at least 4.5:1.

**Actual result:** 3.0:1. axe reports `color-contrast` (serious) on 37 elements of the owner list.

**Severity:** Low. The text can be read, but it is hard for users with low vision.
**Priority:** Low
**Standard:** WCAG 2.2 SC 1.4.3 *Contrast (Minimum)* (Level AA).
**Browser / viewport:** Chromium 1920×1080
**Reproduced outside the tests:** Yes, on 2026-11-02.
**Evidence:** [BUG-016-owner-link-contrast.png](evidence/BUG-016-owner-link-contrast.png) (links outlined in red),
[BUG-011-016-axe-results.json](evidence/BUG-011-016-axe-results.json) (rule `color-contrast`)

---

## BUG-017

**Title:** New Visit page is wider than phone screens (horizontal scrolling)

**Description:** On phones, the New Visit page is wider than the screen, so the page scrolls
sideways and the right part of the form (the fields' clear buttons) is off screen. Two elements stick out:
* **The form's field wrappers (`.col-sm-10`).** On Pixel 7 they measure 432 px on a 412 px screen, 10 px past each edge. This only happens below Bootstrap's 768 px `sm` breakpoint. The likely cause is the Bootstrap row's negative margins, but that was not confirmed in the source.
* **The pet table** (Name / Birth Date / Type / Owner). It does not shrink to fit long names.

**Preconditions:** Logged in; an owner with a pet.

**Steps to reproduce:**
1. On a phone (or in device emulation, e.g. Pixel 7), open an owner and tap **Add Visit** for a pet.
2. Swipe the page sideways.

**Expected result:** The page fits the screen width, with no horizontal scrolling.

**Actual result:**

| Device (browser) | Screen width | New Visit page width | Owner details page width |
|---|---|---|---|
| Pixel 7 (Chromium) | 412 px | **422 px** | 412 px (OK) |
| iPhone 14 (WebKit) | 390 px | **400 px** | 390 px (OK) |
| Galaxy S9+ (Chromium) | 320 px | **375 px** | **349 px** |
| iPad gen 7 (Chromium) | 810 px | 810 px (OK) | 810 px (OK) |

The Owners, New Owner, Veterinarians, New Veterinarian, Pet Types, Specialties and Add Pet pages fit
the screen on Pixel 7 and iPad. RSP-002 checks this on every run.

**Severity:** Medium. Adding a visit is a core task, and on phones it requires sideways scrolling.
**Priority:** Medium
**Browser / viewport:** Pixel 7 (Chromium, 412×839), iPhone 14 (WebKit, 390×664) and Galaxy S9+ (Chromium, 320×658), all emulated by Playwright. The iPad gen 7 (810×1080) was not affected.
**Reproduced outside the tests:** Yes, on 2026-11-02 on all three phones, with two engines (Chromium and WebKit).
**Evidence:** [Pixel 7](evidence/BUG-017-new-visit-pixel-7.png) · [iPhone 14](evidence/BUG-017-new-visit-iphone-14.png) · [Galaxy S9+](evidence/BUG-017-new-visit-galaxy-s9.png). Each was taken scrolled fully to the right, so the navbar ends before the page edge.

**Side effect seen in automation:** On Pixel 7, after a field on this page gets focus, the browser
shifts the view by about 20 px. A click aimed at the button's on-screen position then misses. The mobile tests submit with
focus + Enter instead ([pages/VisitFormPage.ts](../pages/VisitFormPage.ts)). A real user taps what they see, so this was not counted as
separate user impact.

---

## Phase 1 possible defects – final status

The Phase 1 report listed these items as "possible defects to confirm". Each one was checked again outside the
tests on 2026-11-02 (Chromium 1920×1080).

| # | Phase 1 possible defect | Status | Result of the Phase 6 check | Bug / observation |
|---|---|---|---|---|
| PD-1 | Edit Pet: "< Back" does nothing | **Confirmed** | URL unchanged after Back (Chromium, Firefox, WebKit) | [BUG-001](#bug-001) |
| PD-2 | Edit Pet: Owner field is empty | **Not reproduced** | Owner field shows the owner's full name once loading finishes | – |
| PD-3 | Invalid owner ID shows a blank page without an error | **Confirmed** | API 404; blank page with action buttons | [BUG-002](#bug-002) |
| PD-4 | API errors are hidden from the user | **Confirmed** | 404 ignored (BUG-002), 400 not shown (BUG-003, BUG-005 Save Pet, BUG-010) | BUG-002, BUG-003, BUG-005, BUG-010 |
| PD-5 | Only pet type delete asks for confirmation | **Confirmed** | No dialog for visit, pet, vet and specialty; pet type asks | [BUG-004](#bug-004) |
| PD-6 | Submit buttons inconsistent (Save Pet / Add Visit / Save Vet enabled when invalid) | **Confirmed** | All three enabled on an empty form; each sends a request → 400 | [BUG-003](#bug-003), [BUG-005](#bug-005) |
| PD-7 | Specialty can be added without a name | **Not reproduced** | No row is added and "Name is required" is shown. The request is sent and rejected (400) | [OBS-002](#obs-002) |
| PD-8 | New Vet labels the specialty "Type" and allows one | **Confirmed** | Label "Type", single `<select>` | [BUG-006](#bug-006) |
| PD-9a | Every page has the same title | **Confirmed** | "Petclinic Test" on 7 of 7 routes | [BUG-007](#bug-007) |
| PD-9b | Debug messages in the browser console | **Confirmed (observation)** | 2 `console.log` messages on owner search, e.g. "inside search by last name starting with undefined" | [Other observations](#other-observations) |
| PD-9c | `localhost:9966` API URL in production code | **Confirmed (observation)** | Present in `main.*.js`; no request to localhost was made during the session | [Other observations](#other-observations) |
| PD-9d | Telephone has no minimum length | **Confirmed (observation)** | Owner with telephone `123` was saved through the UI (record deleted afterwards) | [Other observations](#other-observations) |

PD-9b, PD-9c and PD-9d behave as described. They are kept as observations, not bugs, because no requirement says what the expected behaviour is.

---

## Observations (not filed as bugs)

These need a requirement decision; no specification states the expected behaviour.

### OBS-001

**Title:** Owner search with no match returns HTTP 404 instead of 200 with an empty list

**Status:** **Confirmed** on 2026-11-02 (`GET owners?lastName=ZzNoSuchName` → 404).

**Severity:** Low · **Priority:** Low · **Type:** API design observation

**Detail:**
* `GET /petclinic/api/owners?lastName=<text with no match>` returns **404**.
* The REST convention for a search or filter that finds nothing is **200 with an empty array** (`[]`). A 404 suggests the *resource* does not exist. For API clients and monitoring, "no results" then looks the same as a wrong URL.
* The UI copes with it: it shows `No owners with LastName starting with "<text>"`. There is no visible effect for users today.

**Steps:**
1. Send `GET /petclinic/api/owners?lastName=ZzNoSuchName` with a valid token.

**Expected (convention):** `200` with body `[]`.

**Actual:** `404`.

**Covered by:** API-003 (asserts the current 404 and is labelled "current behaviour"), OWN-005 (UI message).

### OBS-002

**Title:** Saving an empty specialty name still sends a request (rejected with 400)

**Status:** **Confirmed** on 2026-11-02 (POST → 400; no row added; "Name is required" shown).

**Severity:** Low · **Priority:** Low · **Type:** Client-side validation observation

**Detail:**
* On Specialties → **Add**, clicking **Save** with an empty name sends `POST /petclinic/api/specialties` with `{}`, or `{"name":""}` after typing and clearing.
* The API rejects it with **400** (empty body). No record is created, and the form shows "Name is required".
* No effect for users. The client-side validation just does not stop the request, as on other forms (compare BUG-003 and BUG-005).
* **Correction:** Phase 2 recorded this case as "sends no request". That check missed the request. It was re-checked with a response listener in Phase 4 on 2026-11-02.

**Covered by:** SPC-003 (asserts that the message is shown and nothing is saved; records the POST status).

### Other observations

| Observation | Detail | Status (2026-11-02) |
|---|---|---|
| Telephone has no minimum length (PD-9d) | An owner with telephone `123` was accepted and saved. Only digits and a maximum of 10 are enforced. | Confirmed |
| Debug output in production (PD-9b) | The bundle contains `console.log` calls, e.g. on owner search. | Confirmed |
| Development API URL in bundle (PD-9c) | `http://localhost:9966/petclinic/api/` is present in `main.js`. It is not used at runtime, and no secret is exposed. | Confirmed |

## Investigated and not reproduced

| Suspected issue | Result |
|---|---|
| Edit Pet shows an empty Owner field (PD-2) | **Not a bug.** The field fills in once loading finishes; the first check read it too early. Re-checked 2026-11-02. |
| Specialty can be added with an empty name (PD-7) | **Not reproduced.** No row is added and "Name is required" is shown. The request *is* sent and rejected with 400 ([OBS-002](#obs-002)). Re-checked 2026-11-02. |
| `aria-progressbar-name` on most pages (Phase 4 axe runs) | **Not a page-level defect.** It is the loading spinner, scanned before loading finished. It was filed once as [BUG-015](#bug-015), and A11Y-001 now scans after loading. |
| BUG-013 in WebKit | **Could not be checked.** WebKit does not move to links with Tab by default, so the result depends on the browser setting, not the app. Confirmed in Chromium and Firefox instead. |
