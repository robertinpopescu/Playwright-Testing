# Final QA Summary Report – PetClinic

| | |
|---|---|
| **Application under test** | PetClinic – https://petclinic.bondaracademy.com (Angular SPA) and its REST API https://petclinic-api.bondaracademy.com/petclinic/api/ |
| **Project type** | Learning and portfolio project (Bondar Academy *Playwright UI Testing Mastery* practice application) |
| **Report date** | 2026-11-03 |
| **Execution reported** | TE-001 – full suite on 2026-11-02 ([TEST-EXECUTION-REPORT.md](TEST-EXECUTION-REPORT.md)) |
| **Related** | [TEST-PLAN.md](TEST-PLAN.md) · [TEST-SCENARIOS.md](TEST-SCENARIOS.md) · [TEST-CASES.md](TEST-CASES.md) · [TRACEABILITY-MATRIX.md](TRACEABILITY-MATRIX.md) · [BUG-REPORTS.md](BUG-REPORTS.md) · [Jira structure](jira/README.md) |

## 1. Summary

PetClinic was tested against 123 documented test cases across 12 areas. 120 of them are
automated with Playwright and TypeScript; 3 are manual. The latest full run (2026-11-02,
five browser/device projects) ended with every test in its expected state: **180 passed** and
**29 failed because of open, confirmed defects**, with **0 unexpected failures**.

**17 defects** are filed, each with steps, evidence and an automated test that detects it.
**BUG-009** is the most serious: deleting a pet type silently deletes every pet of that type
and their visit history.

The application's core workflows work (register owner → add pet → record, change and delete a
visit), but the application is **not release-ready** from a quality point of view. It has one
critical data-loss defect, inconsistent delete confirmations and form validation, and
accessibility defects that block keyboard and screen-reader users.

## 2. Scope

| In scope | Out of scope (and why) |
|---|---|
| Navigation, Owners, Pets, Visits, Veterinarians, Pet Types, Specialties | Sign-in / sign-out and session expiry – third-party identity provider, one test account |
| Cross-module data consistency, end-to-end workflow | Owner deletion in the UI – not offered by the application |
| REST API: status codes, structure, invalid input, authentication | Load, stress and penetration testing – shared environment, non-destructive testing only |
| Non-invasive security: script injection, token scope, error exposure | Changing or deleting pre-existing (seed) data – project rule |
| Accessibility: axe-core WCAG 2.1 A/AA, keyboard, accessible names | Visual regression (screenshot comparison) |
| Responsive (iPad gen 7, Pixel 7) and cross-browser smoke (Firefox, WebKit) | |

## 3. Test approach

| Technique | Where it is used |
|---|---|
| Equivalence partitioning | Telephone formats (OWN-012), names with special characters (OWN-021) |
| Boundary value analysis | First-name length 1/2/3 (OWN-011), telephone 9/10/11 digits (OWN-013), dates (VIS-011) |
| State transition / use-case flows | Create → edit → delete for every entity; end-to-end workflow (REG-005) |
| Error guessing | Empty forms, unknown IDs, duplicate names, invalid dates |
| Consistency checks | A change in one module appears in every other module (REG-001 – REG-004), UI ↔ API (API-017) |
| Exploratory testing | 6 recorded exploratory cases where no requirement exists (OWN-006, OWN-014, PET-007, VIS-011, PTY-006, PTY-009) |
| Automated accessibility scanning | axe-core on 10 screens (A11Y-001) plus targeted keyboard and name checks |

The expected results come from observed behaviour and consistency within the application, because
no written requirements exist. Where the expected behaviour is a product decision, the item is
recorded as an **observation**, not a bug.

## 4. Results (TE-001, 2026-11-02)

| Project | Runs | Passed | Failed – known bug | Unexpected |
|---|---|---|---|---|
| chromium (1920×1080) | 137 | 109 | 28 | 0 |
| firefox | 17 | 17 | 0 | 0 |
| webkit | 17 | 17 | 0 | 0 |
| tablet (iPad gen 7) | 19 | 19 | 0 | 0 |
| mobile (Pixel 7) | 19 | 18 | 1 | 0 |
| **Total** | **209** | **180** | **29** | **0** |

By test case (123): **95 passed**, **19 failed because of a confirmed bug**, **6 exploratory
observations recorded**, **3 not executed** (manual: SEC-005, A11Y-005, A11Y-006).
Coverage per feature is in [TRACEABILITY-MATRIX.md](TRACEABILITY-MATRIX.md#coverage-by-feature).

No test data was left behind, and the seed data counts were unchanged before and after the run.

## 5. Defects

| Severity (Jira) | Count | Bugs |
|---|---|---|
| Critical | 1 | [BUG-009](BUG-REPORTS.md#bug-009) – deleting a pet type deletes its pets and visits |
| Major | 1 | [BUG-013](BUG-REPORTS.md#bug-013) – Owners / Veterinarians menus not reachable with the keyboard |
| Minor | 8 | [BUG-001](BUG-REPORTS.md#bug-001), [BUG-002](BUG-REPORTS.md#bug-002), [BUG-003](BUG-REPORTS.md#bug-003), [BUG-004](BUG-REPORTS.md#bug-004), [BUG-008](BUG-REPORTS.md#bug-008), [BUG-010](BUG-REPORTS.md#bug-010), [BUG-012](BUG-REPORTS.md#bug-012), [BUG-017](BUG-REPORTS.md#bug-017) |
| Trivial | 7 | [BUG-005](BUG-REPORTS.md#bug-005), [BUG-006](BUG-REPORTS.md#bug-006), [BUG-007](BUG-REPORTS.md#bug-007), [BUG-011](BUG-REPORTS.md#bug-011), [BUG-014](BUG-REPORTS.md#bug-014), [BUG-015](BUG-REPORTS.md#bug-015), [BUG-016](BUG-REPORTS.md#bug-016) |

Severity mapping from the original reports: BUG-009 raised to Critical; otherwise High → Major,
Medium → Minor, Low → Trivial. All 17 bugs were still present in the 2026-11-02 run.

**Patterns behind the defects**

* **Silent failures.** The client hides API errors: a missing owner shows an empty page
  (BUG-002), invalid visits and names fail without a message (BUG-003, BUG-010).
* **Inconsistent forms.** Some submit buttons are disabled until the form is valid, others are
  not (BUG-003, BUG-005); New Vet and Edit Vet differ (BUG-006).
* **Destructive actions without protection.** Only pet types ask for confirmation (BUG-004), and
  that confirmation hides a cascade delete (BUG-009).
* **Accessibility.** Missing names on links, fields and the spinner (BUG-011, BUG-012, BUG-015),
  menus unreachable by keyboard (BUG-013), contrast and structure issues (BUG-014, BUG-016).

**Observations** (need a requirement decision, not filed as bugs): owner search returns 404
instead of an empty list (OBS-001), empty specialty still sends a request (OBS-002), no minimum
telephone length (OBS-003), debug console output (OBS-004), development API URL in the bundle
(OBS-005).

## 6. Exit criteria (from TEST-PLAN §8)

| Criterion | Status |
|---|---|
| All Critical and High test cases automated and executed on Chromium | Met |
| Smoke suite executed on Firefox and WebKit | Met (functional suites run on Chromium only, by design) |
| Every failure triaged as automation issue or application defect | Met – 0 unexpected failures; all 29 failures map to filed bugs |
| No test-created data left behind | Met |

## 7. Risks, limitations and coverage gaps

* **No written requirements.** Expected results are based on observed behaviour and consistency;
  open questions are recorded as observations.
* **Single shared account and environment.** Tests run serially (1 worker) and clean up after
  themselves; parallel runs on the same account are not supported.
* **Manual cases not yet executed:** SEC-005, A11Y-005, A11Y-006.
* **Not covered:** sign-in/sign-out, session expiry, screen-reader walkthrough, 200 % zoom,
  functional suite on Firefox/WebKit, front-end performance. These are listed as **recommended,
  not implemented** tests REC-001 – REC-014 in [TEST-SCENARIOS.md](TEST-SCENARIOS.md#recommended-additional-coverage).
* **Exploratory values not transcribed.** The observed values of PET-007, VIS-011 and PTY-009 are
  in the 2026-11-02 HTML report only (the report is not committed because traces contain a token).
* **Review item:** [TEST-DATA.md](TEST-DATA.md#7-known-limitations) states that PTY-006 saves a
  pet type with an empty name; no bug has been filed for this yet.

## 8. Recommendations

1. Fix **BUG-009** first: refuse deleting a pet type that is in use, or warn clearly about the cascade.
2. Show API errors to the user instead of replacing them with defaults (BUG-002, BUG-003, BUG-010).
3. Use one validation pattern on every form: disabled submit until valid, plus messages (BUG-003, BUG-005).
4. Add confirmations to every delete (BUG-004).
5. Fix the keyboard access and accessible names (BUG-013, BUG-012, BUG-011, BUG-015) – these block users of assistive technology.
6. Decide the open requirement questions behind OBS-001 – OBS-005.
7. Execute the three manual cases and add the recommended coverage, starting with REC-001/REC-002 (authentication) and REC-005 (Firefox/WebKit functional run).
