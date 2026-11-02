# Bug Reports – PetClinic (petclinic.bondaracademy.com)

Every defect below was reproduced on test-created records (or read-only pages) and the
records were deleted afterwards. Suspected issues that did **not** reproduce are listed at
the end so they are not re-reported.

**Environment:** Chromium (Playwright 1.64.1 bundled build), Windows 11, viewport 1920×1080,
2026-11-02. Each tester account has its own sandbox dataset (see [TEST-PLAN.md](TEST-PLAN.md#test-data-and-cleanup)).

| ID | Title | Severity | Priority |
|---|---|---|---|
| [BUG-001](#bug-001) | "< Back" on Edit Pet page does nothing | Medium | Medium |
| [BUG-002](#bug-002) | Non-existent owner ID shows an empty owner page without an error | Medium | Low |
| [BUG-003](#bug-003) | Submitting an empty New Visit form sends an invalid request and fails silently | Medium | Medium |
| [BUG-004](#bug-004) | Visits, pets, vets and specialties are deleted without confirmation | Medium | Medium |
| [BUG-005](#bug-005) | Save Pet / Save Vet buttons are enabled on an empty form and give no feedback | Low | Low |
| [BUG-006](#bug-006) | New Veterinarian form labels the specialty field "Type" and allows only one | Low | Low |
| [BUG-007](#bug-007) | Every page has the same document title | Low | Low |
| [BUG-008](#bug-008) | API error responses expose Java class names and parser messages | Medium | Low |
| [BUG-009](#bug-009) | Deleting a pet type silently deletes every pet of that type and their visits | High | High |
| [BUG-010](#bug-010) | Owners with accented, hyphenated or apostrophe names cannot be saved, and the form gives no feedback | Medium | Medium |

BUG-001 – BUG-007 were confirmed in Phase 2. BUG-008 – BUG-010 were confirmed in Phase 4 (2026-11-02) while checking the "To confirm" details before writing assertions.

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

**Severity:** Medium – navigation control is broken; workaround exists.
**Priority:** Medium
**Evidence:** [BUG-001-edit-pet-back.png](evidence/BUG-001-edit-pet-back.png) (taken 3 s after clicking Back)

---

## BUG-002

**Title:** Non-existent owner ID shows an empty owner page without an error

**Description:** Opening `/owners/{id}` with an ID that does not exist renders the normal
"Owner Information" page with blank values. The API answers 404, but nothing tells the
user the owner does not exist, and the **Edit Owner** and **Add New Pet** buttons are still
offered for the non-existent owner.

**Preconditions:** Logged in.

**Steps to reproduce:**
1. Open `https://petclinic.bondaracademy.com/owners/999999999`.

**Expected result:** A "not found" message (or redirect to the owner list); no actions for
a non-existent record.

**Actual result:** Blank owner page with Edit Owner / Add New Pet buttons.
`GET /petclinic/api/owners/999999999` → **404**, which the UI ignores.

**Severity:** Medium – misleading state; actions offered on a record that does not exist.
**Priority:** Low – only reachable by URL manipulation or a stale link.
**Evidence:** [BUG-002-invalid-owner-id.png](evidence/BUG-002-invalid-owner-id.png)

**Note:** The client's HTTP services replace failed responses with default values
(`handlerError(...)`), which is the likely root cause of this and BUG-003.

---

## BUG-003

**Title:** Submitting an empty New Visit form sends an invalid request and fails silently

**Description:** The **Add Visit** button is enabled while the form is empty. Clicking it
sends a request with `"date":"Invalid date"`, which the API rejects with HTTP 400. The
user only sees "Description is required" (if the field was touched); the failed request
itself is not reported.

**Preconditions:** Logged in; an owner with a pet exists.

**Steps to reproduce:**
1. Open an owner's details page.
2. Click **Add Visit** for a pet.
3. Leave Date and Description empty and click **Add Visit**.

**Expected result:** The form is not submitted; required-field messages are shown for
Date and Description.

**Actual result:** `POST /petclinic/api/owners/{ownerId}/pets/{petId}/visits` with body
`{"date":"Invalid date", ...}` → **400**. The page stays unchanged; no error is shown and
no message appears for the empty Date field.

**Severity:** Medium – client-side validation is bypassed and an invalid request reaches the API.
**Priority:** Medium
**Evidence:** [BUG-003-empty-add-visit.png](evidence/BUG-003-empty-add-visit.png)

---

## BUG-004

**Title:** Visits, pets, vets and specialties are deleted without confirmation

**Description:** Deleting a **pet type** asks "Delete the pet type?". Deleting a **visit**,
**pet**, **veterinarian** or **specialty** happens immediately on a single click with no
confirmation and no undo. This is inconsistent within the application and makes accidental
data loss easy.

**Preconditions:** Logged in; a record of each kind exists (use test-created records).

**Steps to reproduce:**
1. Owner details page → click **Delete Visit** on a visit.
2. Owner details page → click **Delete Pet** on a pet.
3. Veterinarians → All → click **Delete Vet**.
4. Specialties → click **Delete**.

**Expected result:** A confirmation step, as for pet types.

**Actual result:** Each record is deleted immediately (no dialog was raised).

**Severity:** Medium – irreversible data loss on a mis-click.
**Priority:** Medium
**Evidence:** No dialog appeared in any of the four cases (Playwright dialog listener
recorded none); deleting a pet type raised "Delete the pet type?".

---

## BUG-005

**Title:** Save Pet / Save Vet buttons are enabled on an empty form and give no feedback

**Description:** On **Add Pet** and **New Veterinarian**, the submit button is enabled
while required fields are empty. Clicking it does nothing: no request, no validation
messages. Other forms in the app (Add Owner, Edit Vet) disable the button until the form
is valid.

**Preconditions:** Logged in.

**Steps to reproduce:**
1. Owner details → **Add New Pet** → click **Save Pet** without filling anything.
2. Veterinarians → Add New → click **Save Vet** without filling anything.

**Expected result:** Button disabled until valid (as on Add Owner), or validation
messages shown on click.

**Actual result:** Nothing happens; no messages are displayed.

**Severity:** Low – no data issue, but the user gets no guidance.
**Priority:** Low
**Evidence:** [BUG-005-empty-save-pet.png](evidence/BUG-005-empty-save-pet.png),
[BUG-005-empty-save-vet.png](evidence/BUG-005-empty-save-vet.png)

---

## BUG-006

**Title:** New Veterinarian form labels the specialty field "Type" and allows only one

**Description:** On **New Veterinarian** the specialty dropdown is labelled "Type" and is a
single-select. On **Edit Veterinarian** the same data is labelled "Specialties" and allows
several values. A new vet with two specialties therefore has to be created and then edited.

**Preconditions:** Logged in.

**Steps to reproduce:**
1. Veterinarians → Add New.
2. Inspect the third field.
3. Compare with Veterinarians → All → Edit Vet.

**Expected result:** Same label ("Specialties") and the same multi-select on both forms.

**Actual result:** Label "Type", single `<select>` with radiology / surgery / dentistry.

**Severity:** Low
**Priority:** Low
**Evidence:** [BUG-006-new-vet-type-label.png](evidence/BUG-006-new-vet-type-label.png)

---

## BUG-007

**Title:** Every page has the same document title

**Description:** All checked routes (`/`, `/owners`, `/owners/add`, `/vets`, `/vets/add`,
`/pettypes`, `/specialties`) use the title "Petclinic Test". Browser tabs, history and screen-reader users
cannot tell pages apart (WCAG 2.2 SC 2.4.2 *Page Titled*).

**Preconditions:** None.

**Steps to reproduce:** Visit several pages and read the browser tab title.

**Expected result:** A descriptive title per page, e.g. "Owners – Petclinic".

**Actual result:** "Petclinic Test" on every page.

**Severity:** Low
**Priority:** Low
**Evidence:** `document.title` read on every route during exploration.

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

**Severity:** Medium – information disclosure; no data exposed.
**Priority:** Low
**Evidence:** [BUG-008-api-400-body.json](evidence/BUG-008-api-400-body.json)
**Test:** SEC-004 (known bug)

---

## BUG-009

**Title:** Deleting a pet type silently deletes every pet of that type and their visits

**Description:** Deleting a pet type that is still used by pets removes the **pets and their
visit history** as well. The confirmation dialog only asks "Delete the pet type?" and does
not mention that patient records will be lost. A single mis-click on a lookup value can
delete clinical history for many owners. There is no undo.

**Preconditions:** Logged in; a test-created pet type, and a test-created owner with a pet of
that type and one visit.

**Steps to reproduce:**
1. Pet Types → click **Delete** on the pet type.
2. Accept "Delete the pet type?".
3. Open the owner's page.

**Expected result:** Either the delete is refused while pets use the type (with a message), or
the dialog clearly warns that N pets and their visits will also be deleted.

**Actual result:** The pet type is deleted, and so are the pet (`GET /pets/{id}` → 404) and its
visit (`GET /visits/{id}` → 404). The pet no longer appears on the owner's page.

**Severity:** High – silent loss of clinical records.
**Priority:** High
**Evidence:** Reproduced twice in Phase 4 with API status checks before and after (pet 200 → 404,
visit 200 → 404). Automated in PTY-010.
**Note:** No requirement says whether the cascade is intended. If it is, the defect is that the
dialog does not warn about it.
**Test:** PTY-010 (known bug)

---

## BUG-010

**Title:** Owners with accented, hyphenated or apostrophe names cannot be saved, and the form gives no feedback

**Description:** The New Owner form accepts names such as `José`, `O'Brien`, `Müller` or
`Smith-Jones` and enables **Add Owner**. The API then rejects the request with **400 and an
empty body**, and the form does nothing: no message, no navigation. Unicode in Address and
City is accepted, so only the name fields are affected.

**Preconditions:** Logged in.

**Steps to reproduce:**
1. Owners → Add New.
2. Enter First Name `José`, Last Name `Coleman`, Address `1 Test St`, City `Testville`, Telephone `6085550000`.
3. Click **Add Owner**.

**Expected result:** The owner is saved. If such names are not allowed, the form says so
before submitting.

**Actual result:** `POST /petclinic/api/owners` → **400** (empty body); the page stays on New
Owner with no feedback. The same happens for `O'Brien…`, `Müller…` and `Smith-…` last names.

**Severity:** Medium – common real-world names cannot be registered; the failure is silent.
**Priority:** Medium
**Evidence:** UI and direct API calls for 6 variants; only the name fields with `'`, `-` or
non-ASCII letters were rejected.
**Note:** Whether such names must be accepted is a requirement decision. The silent failure is a defect in either case.
**Test:** OWN-021 (4 known-bug rows)

---

## Observations (not filed as bugs)

These need a requirement decision; no specification states the expected behaviour.

### OBS-001

**Title:** Owner search with no match returns HTTP 404 instead of 200 with an empty list

**Severity:** Low · **Priority:** Low · **Type:** API design observation

**Detail:**
* `GET /petclinic/api/owners?lastName=<text with no match>` → **404**.
* REST convention for a search/filter that finds nothing is **200 with an empty array** (`[]`). A 404 suggests the *resource* does not exist, which makes "no results" indistinguishable from a wrong URL for API clients and monitoring.
* The UI copes with it: it shows `No owners with LastName starting with "<text>"`. So there is no user-visible impact today.

**Steps:**
1. Send `GET /petclinic/api/owners?lastName=ZzNoSuchName` with a valid token.

**Expected (convention):** `200` with body `[]`.

**Actual:** `404`.

**Covered by:** API-003 (asserts the current 404 and is labelled "current behaviour"), OWN-005 (UI message).

### OBS-002

**Title:** Saving an empty specialty name still sends a request (rejected with 400)

**Severity:** Low · **Priority:** Low · **Type:** Client-side validation observation

**Detail:**
* On Specialties → **Add**, clicking **Save** with an empty name sends `POST /petclinic/api/specialties` with `{}` (or `{"name":""}` after typing and clearing).
* The API rejects it with **400** (empty body). No record is created, and the form shows "Name is required".
* No user impact; the client validation just does not stop the request, as on other forms (compare BUG-003).
* **Correction:** Phase 2 recorded this case as "sends no request". That check missed the request. It was re-checked on 2026-11-02 in Phase 4 with a response listener.

**Covered by:** SPC-003 (asserts message shown and nothing saved; records the POST status).

### Other observations

| Observation | Detail |
|---|---|
| Telephone has no minimum length | An owner with telephone `123` was accepted and saved (record deleted afterwards). Only digits and max 10 are enforced. |
| Debug output in production | The bundle contains `console.log` calls (e.g. owner search). |
| Development API URL in bundle | `http://localhost:9966/petclinic/api/` is present in `main.js`. Not used at runtime; no secret exposed. |

## Investigated and not reproduced

| Suspected issue | Result |
|---|---|
| Edit Pet shows an empty Owner field | **Not a bug.** The field fills in once loading finishes; the first check read it too early. |
| Specialty can be added with an empty name | **Not reproduced.** No row is added and "Name is required" is shown. (The request *is* sent and rejected with 400 – see [OBS-002](#obs-002); the Phase 2 note "sends no request" was corrected in Phase 4.) |
