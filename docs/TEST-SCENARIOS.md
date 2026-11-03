# Test Scenarios – PetClinic QA

| | |
|---|---|
| **Related** | [TEST-CASES.md](TEST-CASES.md) · [TRACEABILITY-MATRIX.md](TRACEABILITY-MATRIX.md) · [Jira structure](jira/README.md) |
| **Date** | 2026-11-03 |
| **Source of truth** | Playwright tests in [`tests/`](../tests) and [TEST-CASES.md](TEST-CASES.md) at commit `63be3b5`; results from [TEST-EXECUTION-REPORT.md](TEST-EXECUTION-REPORT.md) (run of 2026-11-02) |


High-level test scenarios, one per application feature. Each scenario groups the detailed
test cases in [TEST-CASES.md](TEST-CASES.md). In Jira, each scenario is a **Story** under its
area's **Epic** (scenario ID = Story ID, e.g. `OWN-S02`), and every test case is linked to it.

The project has **no written requirements**. Scenarios are written as user stories derived
from the application's observed behaviour; they are labelled `derived-from-observed-behaviour`
in Jira.

**Coverage types used below**

| Term | Meaning |
|---|---|
| Automated | A Playwright test exists and ran in the 2026-11-02 run |
| Manual | Manual test case without a Playwright test (the 3 manual cases have not been executed yet) |
| Recommended | **Not implemented and not executed** – a coverage gap proposed in [§ Recommended additional coverage](#recommended-additional-coverage) |

## Summary

| Scenario | Title | Test cases | Automated | Manual | Priority |
|---|---|---|---|---|---|
| [NAV-S01](#nav-s01) | Navigate the application from the navigation bar | 4 | 4 | 0 | High |
| [NAV-S02](#nav-s02) | Open pages directly by URL and handle unknown URLs | 2 | 2 | 0 | Medium |
| [NAV-S03](#nav-s03) | Browser history and page titles | 2 | 2 | 0 | Low |
| [OWN-S01](#own-s01) | View the owner list | 1 | 1 | 0 | High |
| [OWN-S02](#own-s02) | Search owners by last name | 6 | 6 | 0 | High |
| [OWN-S03](#own-s03) | Register a new owner | 9 | 9 | 0 | Critical |
| [OWN-S04](#own-s04) | View owner details | 2 | 2 | 0 | High |
| [OWN-S05](#own-s05) | Edit owner details | 3 | 3 | 0 | High |
| [PET-S01](#pet-s01) | Add a pet to an owner | 8 | 8 | 0 | Critical |
| [PET-S02](#pet-s02) | Edit a pet | 3 | 3 | 0 | High |
| [PET-S03](#pet-s03) | Delete a pet | 3 | 3 | 0 | High |
| [VIS-S01](#vis-s01) | Book a visit for a pet | 8 | 8 | 0 | Critical |
| [VIS-S02](#vis-s02) | Edit a visit | 1 | 1 | 0 | High |
| [VIS-S03](#vis-s03) | Delete a visit | 2 | 2 | 0 | High |
| [VET-S01](#vet-s01) | View the veterinarian list | 1 | 1 | 0 | High |
| [VET-S02](#vet-s02) | Register a new veterinarian | 5 | 5 | 0 | High |
| [VET-S03](#vet-s03) | Edit a veterinarian | 3 | 3 | 0 | High |
| [VET-S04](#vet-s04) | Delete a veterinarian | 2 | 2 | 0 | High |
| [PTY-S01](#pty-s01) | View pet types | 1 | 1 | 0 | High |
| [PTY-S02](#pty-s02) | Add a pet type | 3 | 3 | 0 | High |
| [PTY-S03](#pty-s03) | Rename a pet type | 3 | 3 | 0 | High |
| [PTY-S04](#pty-s04) | Delete a pet type | 3 | 3 | 0 | High |
| [SPC-S01](#spc-s01) | View specialties | 1 | 1 | 0 | High |
| [SPC-S02](#spc-s02) | Add a specialty | 2 | 2 | 0 | High |
| [SPC-S03](#spc-s03) | Rename a specialty | 2 | 2 | 0 | High |
| [SPC-S04](#spc-s04) | Delete a specialty | 3 | 3 | 0 | High |
| [REG-S01](#reg-s01) | Data consistency across modules | 5 | 5 | 0 | High |
| [REG-S02](#reg-s02) | End-to-end clinic workflow | 1 | 1 | 0 | Critical |
| [API-S01](#api-s01) | Owners API | 6 | 6 | 0 | High |
| [API-S02](#api-s02) | Pets and visits API | 4 | 4 | 0 | High |
| [API-S03](#api-s03) | Reference data and vets API | 4 | 4 | 0 | Medium |
| [API-S04](#api-s04) | API access control, consistency and responsiveness | 4 | 4 | 0 | High |
| [SEC-S01](#sec-s01) | Safe handling of script-like input | 2 | 2 | 0 | High |
| [SEC-S02](#sec-s02) | Protection of tokens, errors and credentials | 3 | 2 | 1 | High |
| [A11Y-S01](#a11y-s01) | WCAG 2.1 A/AA automated scan | 1 | 1 | 0 | Medium |
| [A11Y-S02](#a11y-s02) | Keyboard-only operation | 4 | 2 | 2 | Medium |
| [A11Y-S03](#a11y-s03) | Accessible names for fields and indicators | 2 | 2 | 0 | Medium |
| [RSP-S01](#rsp-s01) | Tablet and mobile layout | 2 | 2 | 0 | Medium |
| [RSP-S02](#rsp-s02) | Cross-browser and cross-device smoke | 2 | 2 | 0 | High |

## Scenarios by feature


## Navigation

### NAV-S01

**Navigate the application from the navigation bar**

| | |
|---|---|
| **Feature** | Navigation |
| **Description** | As a clinic employee, I want to reach every main page from the navigation bar, so that I can move between owners, vets and reference data quickly. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Smoke |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [NAV-001](TEST-CASES.md#nav-001--home-page-shows-the-welcome-message) | Home page shows the welcome message | High | Automated | Passed | – |
| [NAV-002](TEST-CASES.md#nav-002--top-level-navbar-links-open-the-correct-pages) | Top-level navbar links open the correct pages | High | Automated | Passed | – |
| [NAV-003](TEST-CASES.md#nav-003--owners-dropdown-opens-search-and-add-new) | Owners dropdown opens Search and Add New | High | Automated | Passed | – |
| [NAV-004](TEST-CASES.md#nav-004--veterinarians-dropdown-opens-all-and-add-new) | Veterinarians dropdown opens All and Add New | High | Automated | Passed | – |

### NAV-S02

**Open pages directly by URL and handle unknown URLs**

| | |
|---|---|
| **Feature** | Navigation |
| **Description** | As a clinic employee, I want bookmarked or typed URLs to open the right page, and unknown URLs to show a clear 'not found' page, so that I never land on a broken screen. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | Medium (highest priority of its test cases) |
| **Testing types** | Functional, Regression, Negative |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [NAV-005](TEST-CASES.md#nav-005--every-route-opens-directly-by-url) | Every route opens directly by URL | Medium | Automated | Passed | – |
| [NAV-006](TEST-CASES.md#nav-006--unknown-url-shows-the-404-page) | Unknown URL shows the 404 page | Medium | Automated | Passed | – |

### NAV-S03

**Browser history and page titles**

| | |
|---|---|
| **Feature** | Navigation |
| **Description** | As a clinic employee, I want browser Back/Forward to work and each page to have its own title, so that I can find my way back and tell browser tabs apart. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | Low (highest priority of its test cases) |
| **Testing types** | Functional, Regression, Accessibility |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [NAV-007](TEST-CASES.md#nav-007--browser-back-and-forward-keep-the-right-page) | Browser back and forward keep the right page | Low | Automated | Passed | – |
| [NAV-008](TEST-CASES.md#nav-008--each-page-has-a-descriptive-title) | Each page has a descriptive title | Low | Automated (known-bug test) | Failed (confirmed bug) | [BUG-007](BUG-REPORTS.md#bug-007) |


## Owners

### OWN-S01

**View the owner list**

| | |
|---|---|
| **Feature** | Owners |
| **Description** | As a receptionist, I want to see all owners with their contact details and pets, so that I can find a client quickly. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Smoke |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [OWN-001](TEST-CASES.md#own-001--owner-list-shows-all-owners-with-the-expected-columns) | Owner list shows all owners with the expected columns | High | Automated | Passed | – |

### OWN-S02

**Search owners by last name**

| | |
|---|---|
| **Feature** | Owners |
| **Description** | As a receptionist, I want to search owners by the start of their last name, so that I can open a client's record without scrolling the full list. |
| **Preconditions** | Signed in with the tester account. Two owners created for this test whose last names share the same prefix and differ only at the end. An owner created for this test with last name Qa<u>. An owner created for this test with a unique last name. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Smoke, Regression, Negative, Exploratory |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [OWN-002](TEST-CASES.md#own-002--search-by-full-last-name-finds-only-matching-owners) | Search by full last name finds only matching owners | High | Automated | Passed | – |
| [OWN-003](TEST-CASES.md#own-003--search-is-case-insensitive) | Search is case-insensitive | Medium | Automated | Passed | – |
| [OWN-004](TEST-CASES.md#own-004--search-matches-the-start-of-the-last-name) | Search matches the start of the last name | Medium | Automated | Passed | – |
| [OWN-005](TEST-CASES.md#own-005--search-with-no-match-shows-a-message) | Search with no match shows a message | Medium | Automated | Passed | – |
| [OWN-006](TEST-CASES.md#own-006--search-with-surrounding-spaces) | Search with surrounding spaces | Low | Automated (exploratory) | Observation recorded | – |
| [OWN-007](TEST-CASES.md#own-007--empty-search-lists-all-owners) | Empty search lists all owners | Medium | Automated | Passed | – |

### OWN-S03

**Register a new owner**

| | |
|---|---|
| **Feature** | Owners |
| **Description** | As a receptionist, I want to register a new owner with validated contact data, so that the clinic has correct client records. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | Critical (highest priority of its test cases) |
| **Testing types** | Functional, Smoke, Negative, Exploratory, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [OWN-008](TEST-CASES.md#own-008--create-an-owner-with-valid-data) | Create an owner with valid data | Critical | Automated | Passed | – |
| [OWN-009](TEST-CASES.md#own-009--add-owner-stays-disabled-until-the-form-is-valid) | Add Owner stays disabled until the form is valid | High | Automated | Passed | – |
| [OWN-010](TEST-CASES.md#own-010--required-field-messages-on-new-owner) | Required-field messages on New Owner | High | Automated | Passed | – |
| [OWN-011](TEST-CASES.md#own-011--first-name-minimum-length-boundary) | First name minimum length (boundary) | Medium | Automated | Passed | – |
| [OWN-012](TEST-CASES.md#own-012--telephone-rejects-non-digits) | Telephone rejects non-digits | Medium | Automated | Passed | – |
| [OWN-013](TEST-CASES.md#own-013--telephone-maximum-length-boundary) | Telephone maximum length (boundary) | Medium | Automated | Passed | – |
| [OWN-014](TEST-CASES.md#own-014--telephone-with-very-few-digits) | Telephone with very few digits | Low | Automated (exploratory) | Observation recorded | – |
| [OWN-019](TEST-CASES.md#own-019--back-on-new-owner-creates-nothing) | Back on New Owner creates nothing | Medium | Automated | Passed | – |
| [OWN-021](TEST-CASES.md#own-021--special-characters-unicode-and-long-values-in-owner-fields) | Special characters, Unicode and long values in owner fields | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-010](BUG-REPORTS.md#bug-010) |

### OWN-S04

**View owner details**

| | |
|---|---|
| **Feature** | Owners |
| **Description** | As a receptionist, I want to see an owner's details with all pets and visits, so that I have the full client history on one page. |
| **Preconditions** | Signed in with the tester account. An owner created for this test with one pet and one visit. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Smoke, Negative |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [OWN-015](TEST-CASES.md#own-015--owner-details-show-pets-and-visits) | Owner details show pets and visits | High | Automated | Passed | – |
| [OWN-020](TEST-CASES.md#own-020--non-existent-owner-id-shows-an-error) | Non-existent owner ID shows an error | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-002](BUG-REPORTS.md#bug-002) |

### OWN-S05

**Edit owner details**

| | |
|---|---|
| **Feature** | Owners |
| **Description** | As a receptionist, I want to correct an owner's details, or cancel without saving, so that client records stay accurate. |
| **Preconditions** | Signed in with the tester account. An owner created for this test. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression, Negative |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [OWN-016](TEST-CASES.md#own-016--edit-an-owner) | Edit an owner | High | Automated | Passed | – |
| [OWN-017](TEST-CASES.md#own-017--edit-owner-validation) | Edit Owner validation | Medium | Automated | Passed | – |
| [OWN-018](TEST-CASES.md#own-018--back-on-edit-owner-discards-changes) | Back on Edit Owner discards changes | Medium | Automated | Passed | – |


## Pets

### PET-S01

**Add a pet to an owner**

| | |
|---|---|
| **Feature** | Pets |
| **Description** | As a receptionist, I want to add a pet with name, birth date and type to an owner, so that the pet can be booked for visits. |
| **Preconditions** | Signed in with the tester account. An owner created for this test. A pet type created for this test. |
| **Priority** | Critical (highest priority of its test cases) |
| **Testing types** | Functional, Smoke, Regression, Negative, Exploratory |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [PET-001](TEST-CASES.md#pet-001--add-a-pet-to-an-owner) | Add a pet to an owner | Critical | Automated | Passed | – |
| [PET-002](TEST-CASES.md#pet-002--add-pet-form-shows-the-owner) | Add Pet form shows the owner | Medium | Automated | Passed | – |
| [PET-003](TEST-CASES.md#pet-003--type-dropdown-lists-all-pet-types) | Type dropdown lists all pet types | High | Automated | Passed | – |
| [PET-004](TEST-CASES.md#pet-004--required-field-messages-on-add-pet) | Required-field messages on Add Pet | Medium | Automated | Passed | – |
| [PET-005](TEST-CASES.md#pet-005--save-pet-on-an-empty-form-gives-feedback) | Save Pet on an empty form gives feedback | Low | Automated (known-bug test) | Failed (confirmed bug) | [BUG-005](BUG-REPORTS.md#bug-005) |
| [PET-006](TEST-CASES.md#pet-006--birth-date-entered-by-typing) | Birth date entered by typing | Medium | Automated | Passed | – |
| [PET-007](TEST-CASES.md#pet-007--birth-date-in-the-future) | Birth date in the future | Low | Automated (exploratory) | Observation recorded | – |
| [PET-011](TEST-CASES.md#pet-011--back-on-add-pet-creates-nothing) | Back on Add Pet creates nothing | Medium | Automated | Passed | – |

### PET-S02

**Edit a pet**

| | |
|---|---|
| **Feature** | Pets |
| **Description** | As a receptionist, I want to edit a pet's details from the owner page, so that pet records stay accurate. |
| **Preconditions** | Signed in with the tester account. An owner created for this test with one pet. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [PET-008](TEST-CASES.md#pet-008--edit-a-pet) | Edit a pet | High | Automated | Passed | – |
| [PET-009](TEST-CASES.md#pet-009--edit-pet-form-is-pre-filled) | Edit Pet form is pre-filled | Medium | Automated | Passed | – |
| [PET-010](TEST-CASES.md#pet-010--back-on-edit-pet-returns-to-the-owner) | Back on Edit Pet returns to the owner | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-001](BUG-REPORTS.md#bug-001) |

### PET-S03

**Delete a pet**

| | |
|---|---|
| **Feature** | Pets |
| **Description** | As a receptionist, I want to remove a pet that is no longer a patient, safely and with a confirmation, so that records are not deleted by accident. |
| **Preconditions** | Signed in with the tester account. An owner created for this test with one pet. An owner created for this test with one pet that has one visit. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [PET-012](TEST-CASES.md#pet-012--delete-a-pet) | Delete a pet | High | Automated | Passed | – |
| [PET-013](TEST-CASES.md#pet-013--deleting-a-pet-asks-for-confirmation) | Deleting a pet asks for confirmation | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-004](BUG-REPORTS.md#bug-004) |
| [PET-014](TEST-CASES.md#pet-014--delete-a-pet-that-has-visits) | Delete a pet that has visits | Medium | Automated | Passed | – |


## Visits

### VIS-S01

**Book a visit for a pet**

| | |
|---|---|
| **Feature** | Visits |
| **Description** | As a receptionist, I want to record a visit with a date and description for a pet, so that the pet's medical history is kept. |
| **Preconditions** | Signed in with the tester account. An owner created for this test with one pet. An owner created for this test with one pet that has one visit. An owner created for this test with one pet born 2020-01-15. |
| **Priority** | Critical (highest priority of its test cases) |
| **Testing types** | Functional, Smoke, Regression, Negative, Exploratory |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [VIS-001](TEST-CASES.md#vis-001--add-a-visit) | Add a visit | Critical | Automated | Passed | – |
| [VIS-002](TEST-CASES.md#vis-002--new-visit-page-shows-the-pet) | New Visit page shows the pet | Medium | Automated | Passed | – |
| [VIS-003](TEST-CASES.md#vis-003--new-visit-page-lists-previous-visits) | New Visit page lists previous visits | Medium | Automated | Passed | – |
| [VIS-004](TEST-CASES.md#vis-004--description-is-required) | Description is required | Medium | Automated | Passed | – |
| [VIS-005](TEST-CASES.md#vis-005--empty-new-visit-form-is-not-submitted) | Empty New Visit form is not submitted | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-003](BUG-REPORTS.md#bug-003) |
| [VIS-006](TEST-CASES.md#vis-006--date-given-description-empty) | Date given, description empty | Medium | Automated | Passed | – |
| [VIS-010](TEST-CASES.md#vis-010--back-on-new-visit-returns-to-the-owner) | Back on New Visit returns to the owner | Medium | Automated | Passed | – |
| [VIS-011](TEST-CASES.md#vis-011--visit-date-edge-values) | Visit date edge values | Low | Automated (exploratory) | Observation recorded | – |

### VIS-S02

**Edit a visit**

| | |
|---|---|
| **Feature** | Visits |
| **Description** | As a receptionist, I want to correct a visit's date or description, so that the visit history is accurate. |
| **Preconditions** | Signed in with the tester account. An owner created for this test with one pet that has one visit. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [VIS-007](TEST-CASES.md#vis-007--edit-a-visit) | Edit a visit | High | Automated | Passed | – |

### VIS-S03

**Delete a visit**

| | |
|---|---|
| **Feature** | Visits |
| **Description** | As a receptionist, I want to delete a wrongly entered visit, with a confirmation, so that history is not lost by a mis-click. |
| **Preconditions** | Signed in with the tester account. An owner created for this test with one pet that has one visit. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [VIS-008](TEST-CASES.md#vis-008--delete-a-visit) | Delete a visit | High | Automated | Passed | – |
| [VIS-009](TEST-CASES.md#vis-009--deleting-a-visit-asks-for-confirmation) | Deleting a visit asks for confirmation | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-004](BUG-REPORTS.md#bug-004) |


## Veterinarians

### VET-S01

**View the veterinarian list**

| | |
|---|---|
| **Feature** | Veterinarians |
| **Description** | As a clinic employee, I want to see all vets and their specialties, so that I know who can treat which cases. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Smoke |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [VET-001](TEST-CASES.md#vet-001--vet-list-shows-names-and-specialties) | Vet list shows names and specialties | High | Automated | Passed | – |

### VET-S02

**Register a new veterinarian**

| | |
|---|---|
| **Feature** | Veterinarians |
| **Description** | As a clinic manager, I want to add a vet with their specialties, so that the vet list is complete. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Smoke, Regression, Negative |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [VET-002](TEST-CASES.md#vet-002--create-a-vet-with-a-specialty) | Create a vet with a specialty | High | Automated | Passed | – |
| [VET-003](TEST-CASES.md#vet-003--create-a-vet-without-a-specialty) | Create a vet without a specialty | Medium | Automated | Passed | – |
| [VET-004](TEST-CASES.md#vet-004--required-field-messages-on-new-veterinarian) | Required-field messages on New Veterinarian | Medium | Automated | Passed | – |
| [VET-005](TEST-CASES.md#vet-005--save-vet-on-an-empty-form-gives-feedback) | Save Vet on an empty form gives feedback | Low | Automated (known-bug test) | Failed (confirmed bug) | [BUG-005](BUG-REPORTS.md#bug-005) |
| [VET-006](TEST-CASES.md#vet-006--new-veterinarian-specialty-field-matches-edit-vet) | New Veterinarian specialty field matches Edit Vet | Low | Automated (known-bug test) | Failed (confirmed bug) | [BUG-006](BUG-REPORTS.md#bug-006) |

### VET-S03

**Edit a veterinarian**

| | |
|---|---|
| **Feature** | Veterinarians |
| **Description** | As a clinic manager, I want to change a vet's name and specialties, or cancel without saving, so that the vet list stays accurate. |
| **Preconditions** | Signed in with the tester account. A vet created for this test without specialties. A vet created for this test. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression, Negative |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [VET-007](TEST-CASES.md#vet-007--edit-a-vets-names-and-specialties) | Edit a vet's names and specialties | High | Automated | Passed | – |
| [VET-008](TEST-CASES.md#vet-008--edit-vet-validation) | Edit Vet validation | Medium | Automated | Passed | – |
| [VET-011](TEST-CASES.md#vet-011--back-on-edit-vet-discards-changes) | Back on Edit Vet discards changes | Medium | Automated | Passed | – |

### VET-S04

**Delete a veterinarian**

| | |
|---|---|
| **Feature** | Veterinarians |
| **Description** | As a clinic manager, I want to remove a vet who has left, with a confirmation, so that the list is current and nothing is deleted by accident. |
| **Preconditions** | Signed in with the tester account. A vet created for this test. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [VET-009](TEST-CASES.md#vet-009--delete-a-vet) | Delete a vet | High | Automated | Passed | – |
| [VET-010](TEST-CASES.md#vet-010--deleting-a-vet-asks-for-confirmation) | Deleting a vet asks for confirmation | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-004](BUG-REPORTS.md#bug-004) |


## Pet Types

### PTY-S01

**View pet types**

| | |
|---|---|
| **Feature** | Pet Types |
| **Description** | As a clinic manager, I want to see the list of pet types, so that I know which types can be assigned to pets. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Smoke |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [PTY-001](TEST-CASES.md#pty-001--pet-type-list) | Pet type list | High | Automated | Passed | – |

### PTY-S02

**Add a pet type**

| | |
|---|---|
| **Feature** | Pet Types |
| **Description** | As a clinic manager, I want to add a new pet type with a required name, so that new kinds of animals can be registered. |
| **Preconditions** | Signed in with the tester account. A pet type created for this test. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Smoke, Negative, Exploratory |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [PTY-002](TEST-CASES.md#pty-002--add-a-pet-type) | Add a pet type | High | Automated | Passed | – |
| [PTY-003](TEST-CASES.md#pty-003--pet-type-name-is-required-on-add) | Pet type name is required on Add | Medium | Automated | Passed | – |
| [PTY-009](TEST-CASES.md#pty-009--duplicate-pet-type-name) | Duplicate pet type name | Low | Automated (exploratory) | Observation recorded | – |

### PTY-S03

**Rename a pet type**

| | |
|---|---|
| **Feature** | Pet Types |
| **Description** | As a clinic manager, I want to rename a pet type or cancel the change, so that type names stay correct. |
| **Preconditions** | Signed in with the tester account. A pet type created for this test. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression, Exploratory |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [PTY-004](TEST-CASES.md#pty-004--rename-a-pet-type-and-rename-it-back-course-assignment) | Rename a pet type and rename it back (course assignment) | High | Automated | Passed | – |
| [PTY-005](TEST-CASES.md#pty-005--cancel-on-edit-pet-type-keeps-the-name) | Cancel on Edit Pet Type keeps the name | Medium | Automated | Passed | – |
| [PTY-006](TEST-CASES.md#pty-006--edit-pet-type-with-an-empty-name) | Edit Pet Type with an empty name | Medium | Automated (exploratory) | Observation recorded | – |

### PTY-S04

**Delete a pet type**

| | |
|---|---|
| **Feature** | Pet Types |
| **Description** | As a clinic manager, I want to delete an unused pet type after confirming, without losing pet records, so that the list stays clean and safe. |
| **Preconditions** | Signed in with the tester account. A pet type created for this test, not used by any pet. A pet type created for this test. An owner created for this test with a pet of that type, and one visit for the pet. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [PTY-007](TEST-CASES.md#pty-007--delete-a-pet-type-after-confirming) | Delete a pet type after confirming | High | Automated | Passed | – |
| [PTY-008](TEST-CASES.md#pty-008--cancel-the-delete-confirmation) | Cancel the delete confirmation | Medium | Automated | Passed | – |
| [PTY-010](TEST-CASES.md#pty-010--delete-a-pet-type-that-a-pet-uses) | Delete a pet type that a pet uses | High | Automated (known-bug test) | Failed (confirmed bug) | [BUG-009](BUG-REPORTS.md#bug-009) |


## Specialties

### SPC-S01

**View specialties**

| | |
|---|---|
| **Feature** | Specialties |
| **Description** | As a clinic manager, I want to see the list of vet specialties, so that I know which specialties can be assigned. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Smoke |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [SPC-001](TEST-CASES.md#spc-001--specialty-list) | Specialty list | High | Automated | Passed | – |

### SPC-S02

**Add a specialty**

| | |
|---|---|
| **Feature** | Specialties |
| **Description** | As a clinic manager, I want to add a specialty with a required name, so that vets can be assigned to it. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Smoke, Negative |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [SPC-002](TEST-CASES.md#spc-002--add-a-specialty) | Add a specialty | High | Automated | Passed | – |
| [SPC-003](TEST-CASES.md#spc-003--empty-specialty-name-is-not-saved) | Empty specialty name is not saved | Medium | Automated | Passed | – |

### SPC-S03

**Rename a specialty**

| | |
|---|---|
| **Feature** | Specialties |
| **Description** | As a clinic manager, I want to rename a specialty or cancel the change, so that specialty names stay correct. |
| **Preconditions** | Signed in with the tester account. A specialty created for this test. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [SPC-004](TEST-CASES.md#spc-004--rename-a-specialty) | Rename a specialty | High | Automated | Passed | – |
| [SPC-005](TEST-CASES.md#spc-005--cancel-on-edit-specialty-keeps-the-name) | Cancel on Edit Specialty keeps the name | Medium | Automated | Passed | – |

### SPC-S04

**Delete a specialty**

| | |
|---|---|
| **Feature** | Specialties |
| **Description** | As a clinic manager, I want to delete a specialty, with a confirmation, and know what happens to vets who have it. |
| **Preconditions** | Signed in with the tester account. A specialty created for this test, not assigned to any vet. A specialty created for this test. A vet created for this test with only that specialty. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [SPC-006](TEST-CASES.md#spc-006--delete-a-specialty) | Delete a specialty | High | Automated | Passed | – |
| [SPC-007](TEST-CASES.md#spc-007--deleting-a-specialty-asks-for-confirmation) | Deleting a specialty asks for confirmation | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-004](BUG-REPORTS.md#bug-004) |
| [SPC-008](TEST-CASES.md#spc-008--delete-a-specialty-that-a-vet-has) | Delete a specialty that a vet has | Medium | Automated | Passed | – |


## Regression / Cross-Module Consistency

### REG-S01

**Data consistency across modules**

| | |
|---|---|
| **Feature** | Regression / Cross-Module Consistency |
| **Description** | As a clinic employee, I want a change made in one place (pet type, specialty, owner) to appear everywhere it is used, so that every screen shows the same data. |
| **Preconditions** | Signed in with the tester account. A pet type created for this test. An owner created for this test with a pet of that type. A specialty created for this test. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Functional, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [REG-001](TEST-CASES.md#reg-001--renamed-pet-type-appears-everywhere) | Renamed pet type appears everywhere | High | Automated | Passed | – |
| [REG-002](TEST-CASES.md#reg-002--new-specialty-is-offered-in-the-vet-forms) | New specialty is offered in the vet forms | High | Automated | Passed | – |
| [REG-003](TEST-CASES.md#reg-003--renamed-specialty-appears-in-the-vet-list) | Renamed specialty appears in the vet list | Medium | Automated | Passed | – |
| [REG-004](TEST-CASES.md#reg-004--edited-owner-appears-in-list-and-search) | Edited owner appears in list and search | High | Automated | Passed | – |
| [REG-006](TEST-CASES.md#reg-006--data-survives-a-full-page-reload) | Data survives a full page reload | Medium | Automated | Passed | – |

### REG-S02

**End-to-end clinic workflow**

| | |
|---|---|
| **Feature** | Regression / Cross-Module Consistency |
| **Description** | As a receptionist, I want to register an owner, add a pet, record, change and remove a visit and remove the pet in one flow, so that the core clinic workflow works from start to finish. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | Critical (highest priority of its test cases) |
| **Testing types** | Functional, Smoke |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [REG-005](TEST-CASES.md#reg-005--end-to-end-clinic-workflow) | End-to-end clinic workflow | Critical | Automated | Passed | – |


## REST API

### API-S01

**Owners API**

| | |
|---|---|
| **Feature** | REST API |
| **Description** | As an API consumer (the web client), I want to list, search, create, read, update and delete owners with correct status codes. |
| **Preconditions** | Signed in with the tester account. An owner created for this test. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Smoke, API, Negative |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [API-001](TEST-CASES.md#api-001--list-owners) | List owners | High | Automated | Passed | – |
| [API-002](TEST-CASES.md#api-002--search-owners-by-last-name) | Search owners by last name | Medium | Automated | Passed | – |
| [API-003](TEST-CASES.md#api-003--owner-search-without-a-match-current-behaviour-404) | Owner search without a match (current behaviour: 404) | Low | Automated | Passed | – |
| [API-004](TEST-CASES.md#api-004--create-read-and-delete-an-owner) | Create, read and delete an owner | High | Automated | Passed | – |
| [API-005](TEST-CASES.md#api-005--update-an-owner) | Update an owner | Medium | Automated | Passed | – |
| [API-006](TEST-CASES.md#api-006--unknown-owner-id) | Unknown owner ID | Medium | Automated | Passed | – |

### API-S02

**Pets and visits API**

| | |
|---|---|
| **Feature** | REST API |
| **Description** | As an API consumer, I want to create, update and delete pets and visits, and invalid visit data to be rejected. |
| **Preconditions** | Signed in with the tester account. An owner created for this test. An owner created for this test with one pet. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | API, Negative |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [API-007](TEST-CASES.md#api-007--create-a-pet-for-an-owner) | Create a pet for an owner | High | Automated | Passed | – |
| [API-008](TEST-CASES.md#api-008--update-and-delete-a-pet) | Update and delete a pet | Medium | Automated | Passed | – |
| [API-009](TEST-CASES.md#api-009--create-update-and-delete-a-visit) | Create, update and delete a visit | Medium | Automated | Passed | – |
| [API-010](TEST-CASES.md#api-010--visit-with-an-invalid-date-is-rejected) | Visit with an invalid date is rejected | Medium | Automated | Passed | – |

### API-S03

**Reference data and vets API**

| | |
|---|---|
| **Feature** | REST API |
| **Description** | As an API consumer, I want full create/read/update/delete for pet types, specialties and vets, and payloads with missing required fields to be rejected. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | Medium (highest priority of its test cases) |
| **Testing types** | API, Negative |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [API-011](TEST-CASES.md#api-011--pet-type-crud) | Pet type CRUD | Medium | Automated | Passed | – |
| [API-012](TEST-CASES.md#api-012--specialty-crud) | Specialty CRUD | Medium | Automated | Passed | – |
| [API-013](TEST-CASES.md#api-013--vet-crud-with-specialties) | Vet CRUD with specialties | Medium | Automated | Passed | – |
| [API-014](TEST-CASES.md#api-014--missing-required-fields-are-rejected) | Missing required fields are rejected | Medium | Automated | Passed | – |

### API-S04

**API access control, consistency and responsiveness**

| | |
|---|---|
| **Feature** | REST API |
| **Description** | As the clinic, I want the API to reject requests without a valid token, to return the same data the UI shows, and to answer in reasonable time. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | API, Security, Regression |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [API-015](TEST-CASES.md#api-015--requests-without-a-token-are-rejected) | Requests without a token are rejected | High | Automated | Passed | – |
| [API-016](TEST-CASES.md#api-016--requests-with-an-invalid-token-are-rejected) | Requests with an invalid token are rejected | High | Automated | Passed | – |
| [API-017](TEST-CASES.md#api-017--ui-and-api-show-the-same-data) | UI and API show the same data | Medium | Automated | Passed | – |
| [API-018](TEST-CASES.md#api-018--response-times-are-reasonable) | Response times are reasonable | Low | Automated | Passed | – |


## Security (non-invasive)

### SEC-S01

**Safe handling of script-like input**

| | |
|---|---|
| **Feature** | Security (non-invasive) |
| **Description** | As the clinic, I want any text a user enters to be shown as plain text and never executed, so that the application is not open to cross-site scripting. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Security |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [SEC-001](TEST-CASES.md#sec-001--script-like-input-in-owner-fields-is-shown-as-text) | Script-like input in owner fields is shown as text | High | Automated | Passed | – |
| [SEC-002](TEST-CASES.md#sec-002--script-like-input-in-names-of-other-entities) | Script-like input in names of other entities | Medium | Automated | Passed | – |

### SEC-S02

**Protection of tokens, errors and credentials**

| | |
|---|---|
| **Feature** | Security (non-invasive) |
| **Description** | As the clinic, I want access tokens to go only to the API, error messages not to reveal internals, and no credentials to be stored in the repository. |
| **Preconditions** | Signed in with the tester account. A test run has finished. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Security, API |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [SEC-003](TEST-CASES.md#sec-003--access-token-is-sent-only-to-the-api) | Access token is sent only to the API | High | Automated | Passed | – |
| [SEC-004](TEST-CASES.md#sec-004--api-errors-do-not-leak-internal-details) | API errors do not leak internal details | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-008](BUG-REPORTS.md#bug-008) |
| [SEC-005](TEST-CASES.md#sec-005--no-credentials-or-tokens-in-the-repository-or-reports) | No credentials or tokens in the repository or reports | Medium | Manual | Not Executed | – |


## Accessibility

### A11Y-S01

**WCAG 2.1 A/AA automated scan**

| | |
|---|---|
| **Feature** | Accessibility |
| **Description** | As a user who relies on assistive technology, I want every main page to meet WCAG 2.1 A/AA rules that can be checked automatically. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | Medium (highest priority of its test cases) |
| **Testing types** | Accessibility |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [A11Y-001](TEST-CASES.md#a11y-001--automated-axe-scan-of-every-main-page) | Automated axe scan of every main page | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-011](BUG-REPORTS.md#bug-011), [BUG-012](BUG-REPORTS.md#bug-012), [BUG-014](BUG-REPORTS.md#bug-014), [BUG-016](BUG-REPORTS.md#bug-016) |

### A11Y-S02

**Keyboard-only operation**

| | |
|---|---|
| **Feature** | Accessibility |
| **Description** | As a keyboard-only user, I want to reach every menu and complete forms without a mouse, with a visible focus indicator. |
| **Preconditions** | Signed in with the tester account. An owner created for this test. |
| **Priority** | Medium (highest priority of its test cases) |
| **Testing types** | Accessibility |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [A11Y-002](TEST-CASES.md#a11y-002--navbar-works-with-the-keyboard-only) | Navbar works with the keyboard only | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-013](BUG-REPORTS.md#bug-013) |
| [A11Y-003](TEST-CASES.md#a11y-003--new-owner-form-can-be-completed-with-the-keyboard) | New Owner form can be completed with the keyboard | Medium | Automated | Passed | – |
| [A11Y-005](TEST-CASES.md#a11y-005--visible-focus-indicator) | Visible focus indicator | Low | Manual | Not Executed | – |
| [A11Y-006](TEST-CASES.md#a11y-006--date-picker-works-with-the-keyboard) | Date picker works with the keyboard | Low | Manual | Not Executed | – |

### A11Y-S03

**Accessible names for fields and indicators**

| | |
|---|---|
| **Feature** | Accessibility |
| **Description** | As a screen-reader user, I want every form field and the loading indicator to have a name, so that I know what each element is. |
| **Preconditions** | Signed in with the tester account. An owner with one pet created for this test. |
| **Priority** | Medium (highest priority of its test cases) |
| **Testing types** | Accessibility |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [A11Y-004](TEST-CASES.md#a11y-004--form-fields-have-accessible-names) | Form fields have accessible names | Medium | Automated (known-bug test) | Failed (confirmed bug) | [BUG-012](BUG-REPORTS.md#bug-012) |
| [A11Y-007](TEST-CASES.md#a11y-007--loading-indicator-has-an-accessible-name) | Loading indicator has an accessible name | Low | Automated (known-bug test) | Failed (confirmed bug) | [BUG-015](BUG-REPORTS.md#bug-015) |


## Responsive / Cross-Browser

### RSP-S01

**Tablet and mobile layout**

| | |
|---|---|
| **Feature** | Responsive / Cross-Browser |
| **Description** | As a clinic employee on a tablet or phone, I want every page to be usable without horizontal scrolling and the menu to reach every page. |
| **Preconditions** | Signed in with the tester account. An owner with one pet created for this test. |
| **Priority** | Medium (highest priority of its test cases) |
| **Testing types** | Responsive |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [RSP-001](TEST-CASES.md#rsp-001--mobile-navigation-menu) | Mobile navigation menu | Medium | Automated | Passed | – |
| [RSP-002](TEST-CASES.md#rsp-002--no-horizontal-page-scroll-on-tablet-and-mobile) | No horizontal page scroll on tablet and mobile | Low | Automated (known-bug test) | Failed (confirmed bug) | [BUG-017](BUG-REPORTS.md#bug-017) |

### RSP-S02

**Cross-browser and cross-device smoke**

| | |
|---|---|
| **Feature** | Responsive / Cross-Browser |
| **Description** | As a clinic employee, I want the core workflows to work the same on Chromium, Firefox, WebKit (Safari), tablet and mobile. |
| **Preconditions** | Signed in with the tester account. No records needed beyond the seed data. |
| **Priority** | High (highest priority of its test cases) |
| **Testing types** | Smoke |

| Test case | Title | Priority | Automation | Last result | Bugs |
|---|---|---|---|---|---|
| [RSP-003](TEST-CASES.md#rsp-003--create-an-owner-on-mobile) | Create an owner on mobile | Medium | Automated (indirect, @smoke projects) | Passed | – |
| [RSP-004](TEST-CASES.md#rsp-004--smoke-suite-on-firefox-webkit-tablet-and-mobile) | Smoke suite on Firefox, WebKit, tablet and mobile | High | Automated (indirect, @smoke projects) | Passed | – |


## Recommended additional coverage

> **Not implemented. Not executed.** These are coverage gaps found while analysing the suite
> on 2026-11-03. They are listed so the gaps are visible; none of them is an existing test or
> has a result. In Jira they are Tasks labelled `recommended-coverage` and `not-implemented`.

| ID | Feature | Proposed test | Priority (proposed) | Why |
|---|---|---|---|---|
| REC-001 | Security (non-invasive) | Sign in with valid credentials and sign out | Medium | Login is only exercised indirectly by the automation's global setup; no test checks the sign-in/sign-out flows. |
| REC-002 | Security (non-invasive) | Session expiry and token refresh | Medium | Not covered; the test plan lists session expiry as out of scope because only one test account is available. |
| REC-003 | Accessibility | Screen-reader walkthrough of the create-owner and add-visit flows | Medium | Automated scans cannot judge announcement quality. |
| REC-004 | Accessibility | Text resize and zoom to 200% | Low | Not covered. |
| REC-005 | Responsive / Cross-Browser | Full functional suite on Firefox and WebKit | Medium | Firefox and WebKit currently run only the @smoke suite, by design, to keep the run time down. |
| REC-006 | Visits | Visit dated before the pet's birth date | Low | VIS-011 records this value among other edge dates; a dedicated case with a requirement decision is recommended. |
| REC-007 | Visits | Edit Visit validation (empty description and date) | Medium | Only the New Visit form's validation is covered. |
| REC-008 | Owners | Concurrent edit of the same owner in two browser tabs | Low | Not covered. |
| REC-009 | Owners | Duplicate owner (same name and telephone) | Low | PTY-009 covers duplicates for pet types only. |
| REC-010 | Specialties | Duplicate specialty name | Low | Only pet types are checked for duplicates (PTY-009). |
| REC-011 | Pets | Maximum length and special characters in the pet name | Low | OWN-021 covers these values for owners only. |
| REC-012 | Veterinarians | Remove all specialties from a vet on Edit Vet | Low | VET-007 covers adding specialties only. |
| REC-013 | Navigation | Page-load time baseline (single user) | Low | No front-end performance measurement exists; load testing stays out of scope on the shared environment. |
| REC-014 | Accessibility | Error messages announced to assistive technology | Low | Not covered by the automated scans. |
