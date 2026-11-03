# Test Coverage – PetClinic QA Automation

| | |
|---|---|
| **Related** | [TEST-PLAN.md](TEST-PLAN.md) · [TEST-CASES.md](TEST-CASES.md) · [BUG-REPORTS.md](BUG-REPORTS.md) |
| **Status** | Phase 6 – bugs BUG-011 – BUG-017 filed and linked; execution results in [TEST-EXECUTION-REPORT.md](TEST-EXECUTION-REPORT.md). |
| **Date** | 2026-11-02 |

This document maps every feature to the test cases that cover it. Section 4 traces the
possible defects found in Phase 1 to their outcome and to the cases that cover them.

## 1. Summary

**123 test cases.** Counts were computed from [TEST-CASES.md](TEST-CASES.md). All cases planned as "To automate" are now automated; the column names were updated on 2026-11-03.

| Module | Cases | Critical | High | Medium | Low | Automated (course assignment) | Automated | Automated – known bug | Exploratory | Manual |
|---|---|---|---|---|---|---|---|---|---|---|
| NAV  | 8  | – | 4 | 2  | 2  | 1 | 6  | 1  | – | – |
| OWN  | 21 | 1 | 6 | 12 | 2  | – | 18 | 1  | 2 | – |
| PET  | 14 | 1 | 3 | 8  | 2  | – | 10 | 3  | 1 | – |
| VIS  | 11 | 1 | 2 | 7  | 1  | – | 8  | 2  | 1 | – |
| VET  | 11 | – | 4 | 5  | 2  | – | 8  | 3  | – | – |
| PTY  | 10 | – | 5 | 4  | 1  | 1 | 6  | 1  | 2 | – |
| SPC  | 8  | – | 4 | 4  | –  | – | 7  | 1  | – | – |
| REG  | 6  | 1 | 3 | 2  | –  | – | 6  | –  | – | – |
| API  | 18 | – | 5 | 11 | 2  | – | 18 | –  | – | – |
| SEC  | 5  | – | 2 | 3  | –  | – | 3  | 1  | – | 1 |
| A11Y | 7  | – | – | 4  | 3  | – | 1  | 4  | – | 2 |
| RSP  | 4  | – | 1 | 2  | 1  | – | 3  | 1  | – | – |
| **Total** | **123** | **4** | **39** | **64** | **16** | **2** | **94** | **18** | **6** | **3** |

**Changes in Phase 4:**
* PTY-010 became a known-bug case (BUG-009), priority Medium → High.
* SEC-004 became a known-bug case (BUG-008).
* SPC-008 became a normal automated case; its behaviour is now observed.
* OWN-021 is counted under "Automated", but 4 of its 6 data rows are known-bug rows (BUG-010).

**Changes in Phase 6:**
* A11Y-001, A11Y-002 and A11Y-004 became known-bug cases (BUG-011 – BUG-014, BUG-016).
* RSP-002 became a known-bug case on phones (BUG-017).
* **A11Y-007 is new**: the loading spinner's accessible name (BUG-015), priority Low.

**Automation: 120 of 123 cases (98 %).**
* 114 cases are automated as pass/fail tests (existing, to automate, known bug).
* The 6 exploratory cases are automated as **recording** tests (tag `@exploratory`): they write
  the observed result into the report and assert only what must always hold.
* The 3 manual cases are SEC-005, A11Y-005 and A11Y-006.
* RSP-003 and RSP-004 have no test of their own. They are covered by the `@smoke` tests that the
  `mobile`, `tablet`, `firefox` and `webkit` projects run.

## 2. Feature → test case matrix

Legend: **✓** = covered · **bug** = a case currently expected to fail because of a confirmed
bug · **exp** = exploratory · **man** = manual.

### Navigation

| Feature | Test cases |
|---|---|
| Home page / welcome | NAV-001 |
| Top-level navbar links | NAV-002, A11Y-002 |
| Owners dropdown (Search, Add New) | NAV-003, A11Y-002 |
| Veterinarians dropdown (All, Add New) | NAV-004, A11Y-002 |
| Direct URL access | NAV-005 |
| 404 page | NAV-006 |
| Browser history | NAV-007 |
| Page titles | NAV-008 (bug) |
| Mobile menu | RSP-001 |

### Owners

| Feature | Positive | Negative / boundary | Other |
|---|---|---|---|
| List owners | OWN-001 | – | API-001, API-017 |
| Search by last name | OWN-002, OWN-003, OWN-004, OWN-007 | OWN-005, OWN-006 (exp) | API-002, API-003, REG-004 |
| Create owner | OWN-008, RSP-003 | OWN-009, OWN-010, OWN-011, OWN-012, OWN-013, OWN-014 (exp), OWN-021 | OWN-019, API-004, SEC-001, A11Y-003 |
| View owner details | OWN-015 | OWN-020 (bug) | API-006 |
| Edit owner | OWN-016 | OWN-017 | OWN-018, REG-004, API-005 |
| Delete owner | – (not offered in the UI) | – | API-004 (also used for cleanup) |

### Pets

| Feature | Positive | Negative / boundary | Other |
|---|---|---|---|
| Add pet | PET-001, PET-002, PET-006 | PET-004, PET-005 (bug), PET-007 (exp) | PET-011, API-007 |
| Pet type dropdown | PET-003 | – | REG-001 |
| Edit pet | PET-008, PET-009 | – | PET-010 (bug), REG-001, API-008 |
| Delete pet | PET-012, PET-014 | – | PET-013 (bug), API-008, REG-005 |
| Birth date picker | PET-001, PET-006 | PET-007 (exp) | A11Y-006 (man) |

### Visits

| Feature | Positive | Negative / boundary | Other |
|---|---|---|---|
| Add visit | VIS-001, VIS-002 | VIS-004, VIS-005 (bug), VIS-006, VIS-011 (exp) | VIS-010, API-009, API-010 |
| Previous visits list | VIS-003 | – | OWN-015 |
| Edit visit | VIS-007 | – | REG-005, API-009 |
| Delete visit | VIS-008 | – | VIS-009 (bug), PET-014, API-009 |

### Veterinarians

| Feature | Positive | Negative / boundary | Other |
|---|---|---|---|
| List vets | VET-001 | – | API-017 |
| Add vet | VET-002, VET-003 | VET-004, VET-005 (bug) | VET-006 (bug), API-013, API-014 |
| Edit vet (multi-specialty) | VET-007 | VET-008 | VET-011, REG-002, API-013 |
| Delete vet | VET-009 | – | VET-010 (bug), API-013 |

### Pet types

| Feature | Positive | Negative / boundary | Other |
|---|---|---|---|
| List | PTY-001 | – | API-017 |
| Add (inline) | PTY-002 | PTY-003, PTY-009 (exp) | API-011, SEC-002 |
| Edit / rename | PTY-004 (exists) | PTY-006 (exp) | PTY-005, REG-001, API-011 |
| Delete with confirmation | PTY-007 | – | PTY-008, PTY-010 (bug), API-011 |

### Specialties

| Feature | Positive | Negative / boundary | Other |
|---|---|---|---|
| List | SPC-001 | – | API-017 |
| Add (inline) | SPC-002 | SPC-003 | API-012, SEC-002 |
| Edit / rename | SPC-004 | – | SPC-005, REG-003, API-012 |
| Delete | SPC-006 | – | SPC-007 (bug), SPC-008, API-012 |
| Used by vets | REG-002, REG-003 | – | SPC-008 |

### Cross-cutting

| Area | Test cases |
|---|---|
| End-to-end workflow | REG-005 |
| Data persistence across `/seed` | REG-006 |
| UI ↔ API consistency | API-017, plus API checks inside OWN-016, PET-008, VIS-007, VET-007 |
| API authentication | API-015, API-016, SEC-003 |
| API error handling | API-003, API-006, API-010, API-014, SEC-004 |
| XSS / input handling | SEC-001, SEC-002, OWN-021 |
| Secrets in repo/reports | SEC-005 (man) |
| Accessibility | A11Y-001 – A11Y-007, NAV-008 |
| Responsive / cross-browser | RSP-001 – RSP-004 |

## 3. Test type × module matrix

The numbers are case counts by tag, computed from TEST-CASES.md. A case with two tags
(e.g. `@api @security`) is counted in both rows. These tags are the ones used with `--grep`.

| Tag | NAV | OWN | PET | VIS | VET | PTY | SPC | REG | API | SEC | A11Y | RSP |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @smoke | 4 | 4 | 1 | 1 | 2 | 2 | 2 | 1 | 1 | – | – | 2 |
| @regression | 2 | 6 | 10 | 6 | 6 | 5 | 5 | 5 | 1 | – | – | – |
| @negative | 1 | 11 | 3 | 4 | 3 | 3 | 1 | – | 4 | – | – | – |
| @api | – | – | – | – | – | – | – | – | 18 | 1 | – | – |
| @security | – | – | – | – | – | – | – | – | 2 | 5 | – | – |
| @a11y | 1 | – | – | – | – | – | – | – | – | – | 6 | – |
| @responsive | – | – | – | – | – | – | – | – | – | – | – | 2 |

In the code, the six exploratory cases (OWN-006, OWN-014, PET-007, VIS-011, PTY-006, PTY-009)
carry the tag `@exploratory` instead of the tags listed above, so they can be run or excluded
as a group. Cross-browser coverage comes from the Playwright projects (next table).

**Browsers and viewports** (from [TEST-PLAN.md §5](TEST-PLAN.md#5-environments-browsers-and-viewports)):

| Suite | chromium | firefox | webkit | tablet | mobile |
|---|---|---|---|---|---|
| @smoke | ✓ | ✓ (RSP-004) | ✓ (RSP-004) | ✓ (RSP-004) | ✓ (RSP-003, RSP-004) |
| Functional, negative, regression, exploratory | ✓ | – | – | – | – |
| API (@api) | ✓ (no browser needed) | – | – | – | – |
| @a11y, @security | ✓ | – | – | – | – |
| @responsive (RSP-001, RSP-002) | – | – | – | ✓ | ✓ |

**Change from the test plan:** Firefox and WebKit run the `@smoke` suite only, not the full
functional suite. Running every functional test three times against the shared remote site
with one worker would roughly triple the run time for little extra signal. More can be run on
demand, e.g. `npx playwright test --project=firefox --grep @regression` after removing the
project's `grep` filter in `playwright.config.ts`.

## 4. Phase 1 possible defects → outcome → covering test cases

These are the nine items listed as "possible defects to confirm" in the Phase 1 report, with
their Phase 2 outcome. Every item, including the ones that turned out not to be bugs, has a
test case. That way a confirmed bug is detected again, and a non-bug that later becomes one
is caught.

| # | Phase 1 possible defect | Phase 2 / 4 outcome | Bug | Covering test cases |
|---|---|---|---|---|
| PD-1 | Edit Pet: "< Back" does nothing | **Confirmed** | [BUG-001](BUG-REPORTS.md#bug-001) | PET-010 (bug) |
| PD-2 | Edit Pet: Owner field is empty | **Not a bug.** The field was read before loading finished. | – | PET-009 (regression guard: Owner field is filled after the spinner) |
| PD-3 | Invalid owner ID shows a blank page without an error | **Confirmed** | [BUG-002](BUG-REPORTS.md#bug-002) | OWN-020 (bug), API-006 |
| PD-4 | API errors are hidden from the user | **Confirmed** through two concrete cases: BUG-002 (404 ignored) and BUG-003 (400 not shown) | BUG-002, BUG-003 | OWN-020 (bug), VIS-005 (bug), VIS-006, API-010 |
| PD-5 | Only pet type delete asks for confirmation | **Confirmed** for visits, pets, vets and specialties | [BUG-004](BUG-REPORTS.md#bug-004) | PET-013, VIS-009, VET-010, SPC-007 (all bug); PTY-007, PTY-008 (the pet type confirmation that works) |
| PD-6 | Submit buttons inconsistent (enabled on invalid Save Pet / Add Visit / Save Vet) | **Confirmed.** Save Pet and Save Vet → BUG-005; Add Visit → BUG-003 | [BUG-005](BUG-REPORTS.md#bug-005), [BUG-003](BUG-REPORTS.md#bug-003) | PET-005, VET-005, VIS-005 (all bug); OWN-009, OWN-017, VET-008 (the forms that disable correctly) |
| PD-7 | Specialty Add doesn't require a name | **Not reproduced.** No row is added and "Name is required" is shown. Phase 4 correction: the request *is* sent and rejected with 400 ([OBS-002](BUG-REPORTS.md#obs-002)). | – | SPC-003 (regression guard) |
| PD-8 | New Vet labels specialty "Type" and allows one | **Confirmed** | [BUG-006](BUG-REPORTS.md#bug-006) | VET-006 (bug), VET-007, REG-002 |
| PD-9a | Every page has the same title | **Confirmed** | [BUG-007](BUG-REPORTS.md#bug-007) | NAV-008 (bug) |
| PD-9b | Debug messages in the browser console | Observation (needs a requirement) | – | Not a test case. Noted in BUG-REPORTS observations. |
| PD-9c | `localhost:9966` API URL in production code | Observation. It is not used at runtime and exposes no secret. | – | SEC-003 (all real traffic goes to the configured API host) |
| PD-9d | Telephone has no minimum length | Observation (needs a requirement) | – | OWN-014 (exp), OWN-013 |

**Found in Phase 4 (not Phase 1 possible defects):**

| Finding | Outcome | Covering test cases |
|---|---|---|
| API error bodies expose Java class names | **Confirmed** → [BUG-008](BUG-REPORTS.md#bug-008) | SEC-004 (bug) |
| Deleting a pet type in use deletes its pets and visits | **Confirmed** → [BUG-009](BUG-REPORTS.md#bug-009) | PTY-010 (bug) |
| Owner names with accents, apostrophes or hyphens fail silently | **Confirmed** → [BUG-010](BUG-REPORTS.md#bug-010) | OWN-021 rows 1–4 (bug) |
| Empty specialty name still sends a request (400) | Observation [OBS-002](BUG-REPORTS.md#obs-002) | SPC-003 |
| Owner search 404 instead of `200 []` | Observation [OBS-001](BUG-REPORTS.md#obs-001) | API-003 (current behaviour) |
| Logo link without a name | **Confirmed** → [BUG-011](BUG-REPORTS.md#bug-011) (Phase 6) | A11Y-001 (bug) |
| Form fields without accessible names | **Confirmed** → [BUG-012](BUG-REPORTS.md#bug-012) (Phase 6) | A11Y-001, A11Y-004 (bug) |
| Owners / Veterinarians menus not reachable with Tab | **Confirmed** → [BUG-013](BUG-REPORTS.md#bug-013) (Phase 6) | A11Y-002 (bug) |
| Invalid definition list on owner details | **Confirmed** → [BUG-014](BUG-REPORTS.md#bug-014) (Phase 6) | A11Y-001 (bug) |
| Loading spinner without a name | **Confirmed** → [BUG-015](BUG-REPORTS.md#bug-015) (Phase 6) | A11Y-007 (bug) |
| Owner list links with 3:1 contrast | **Confirmed** → [BUG-016](BUG-REPORTS.md#bug-016) (found in Phase 6, once A11Y-001 scanned after loading) | A11Y-001 (bug) |
| New Visit page wider than phone screens | **Confirmed** → [BUG-017](BUG-REPORTS.md#bug-017) (Phase 6; Pixel 7, iPhone 14, Galaxy S9+) | RSP-002 (mobile, bug) |

## 5. Confirmed bugs → test cases (reverse view)

| Bug | Severity / priority | Test cases that reproduce it |
|---|---|---|
| [BUG-001](BUG-REPORTS.md#bug-001) Edit Pet "< Back" does nothing | Medium / Medium | PET-010 |
| [BUG-002](BUG-REPORTS.md#bug-002) Non-existent owner shows a blank page | Medium / Low | OWN-020 |
| [BUG-003](BUG-REPORTS.md#bug-003) Empty New Visit sends an invalid request and fails silently | Medium / Medium | VIS-005 |
| [BUG-004](BUG-REPORTS.md#bug-004) Deletes without confirmation | Medium / Medium | PET-013, VIS-009, VET-010, SPC-007 |
| [BUG-005](BUG-REPORTS.md#bug-005) Save Pet / Save Vet enabled on an empty form and submit it | Low / Low | PET-005, VET-005 |
| [BUG-006](BUG-REPORTS.md#bug-006) New Vet field "Type", single select | Low / Low | VET-006 |
| [BUG-007](BUG-REPORTS.md#bug-007) Same page title everywhere | Low / Low | NAV-008 |
| [BUG-008](BUG-REPORTS.md#bug-008) API errors expose internal class names | Medium / Low | SEC-004 |
| [BUG-009](BUG-REPORTS.md#bug-009) Deleting a pet type deletes its pets and visits | High / High | PTY-010 |
| [BUG-010](BUG-REPORTS.md#bug-010) Names with accents / apostrophes / hyphens fail silently | Medium / Medium | OWN-021 (rows 1–4) |
| [BUG-011](BUG-REPORTS.md#bug-011) Logo link has no accessible name | Low / Medium | A11Y-001 (all 8 scan tests) |
| [BUG-012](BUG-REPORTS.md#bug-012) Form fields without accessible names | Medium / Medium | A11Y-001 (Owners, Pet Types, Specialties, Add Pet, New Visit), A11Y-004 |
| [BUG-013](BUG-REPORTS.md#bug-013) Owners / Veterinarians menus not reachable with the keyboard | High / High | A11Y-002 |
| [BUG-014](BUG-REPORTS.md#bug-014) Invalid definition list on owner details | Low / Low | A11Y-001 (owner details) |
| [BUG-015](BUG-REPORTS.md#bug-015) Loading spinner has no accessible name | Low / Low | A11Y-007 |
| [BUG-016](BUG-REPORTS.md#bug-016) Owner list links have 3:1 contrast | Low / Low | A11Y-001 (Owners) |
| [BUG-017](BUG-REPORTS.md#bug-017) New Visit page wider than phone screens | Medium / Medium | RSP-002 (mobile project) |

**How known-bug tests work.** These 18 cases are automated with the `knownBug()` helper ([fixtures/index.ts](../fixtures/index.ts)).
* The test asserts the correct behaviour. When it reaches the bug assertion, it calls Playwright's `test.fail()` and adds an `issue` annotation with the bug ID.
* **Bug still there:** the test is reported as an expected failure, and the suite stays green.
* **Bug fixed:** the test is reported as "Expected to fail, but passed". That is the signal to update BUG-REPORTS and remove `knownBug()`.
* **Any other failure:** reported as a real failure. A setup step fails before `test.fail()` is set, and the `knownBugGuard` fixture flags a cleanup error after it.
* Running with `VERIFY_KNOWN_BUGS=1` runs them as normal tests, to check that each fails at its bug assertion.

A11Y-001 and RSP-002 link each known violation to its bug. A violation or overflow that is not linked to a bug fails the test normally.

## 6. "To confirm" details – resolved in Phase 4

All details that had not been seen in Phase 1 were checked against the application on
2026-11-02, before the assertions were written. The cases are now marked "Observed (Phase 4)".

| Case | Detail | Result |
|---|---|---|
| OWN-007 | Empty search | Lists all owners again |
| OWN-019, PET-011, VET-011 | Where **Back** goes | `/owners`, `/owners/{id}`, `/vets`; nothing is saved |
| PET-006 | Typed birth date | `2020/01/15` is accepted and saved as `2020-01-15` |
| PET-014 | Visits of a deleted pet | Deleted as well (404) |
| VIS-006 | Date only | No request, no visit, form stays open, no message |
| VIS-007 | Edit Visit form | Heading "Edit Visit", buttons Back / Update Visit |
| API-004 … API-013 | Success codes | Create 201, update 204, delete 204, read after delete 404 |
| API-014 | Invalid payloads | 400 with an empty body |
| PTY-010 | Delete a type in use | Pets and visits of that type are deleted → BUG-009 |
| SPC-008 | Delete a specialty in use | Vet stays and loses only that specialty |
| RSP-001 | Mobile navbar | Does not collapse; all items stay visible and usable |

## 7. Not covered (and why)

| Item | Reason |
|---|---|
| Login, logout, session expiry | Auth0 is a third-party identity provider, and only one test account is available. Login is exercised indirectly by global setup. |
| Deleting an owner in the UI | The UI does not offer it. The API delete is covered by API-004. |
| Load, stress, penetration testing | The environment is shared, so only non-destructive testing is allowed. API-018 is a single-request sanity check only. |
| Changing or deleting seed records | Forbidden by the project rules. Seed data is only read (OWN-001, VET-001, PTY-001, SPC-001, API-001, API-017). |
| Console output, `localhost` URL in the bundle | Need a requirement decision; recorded as observations (PD-9b, PD-9c). |
| Visual regression (screenshot comparison) | Not requested. Screenshots are kept on failure as evidence only. |
