# Test Plan – PetClinic QA Automation

| | |
|---|---|
| **Application under test** | PetClinic – https://petclinic.bondaracademy.com (Angular SPA) |
| **API** | https://petclinic-api.bondaracademy.com/petclinic/api/ (REST, Auth0 bearer token) |
| **Framework** | Playwright Test 1.64 + TypeScript, `@axe-core/playwright` for accessibility |
| **Status** | Phase 6 – bugs filed ([BUG-REPORTS.md](BUG-REPORTS.md)), execution report in [TEST-EXECUTION-REPORT.md](TEST-EXECUTION-REPORT.md). Portfolio documents added 2026-11-03: [TEST-SCENARIOS.md](TEST-SCENARIOS.md), [TRACEABILITY-MATRIX.md](TRACEABILITY-MATRIX.md), [QA-SUMMARY.md](QA-SUMMARY.md), [jira/](jira/README.md) |
| **Date** | 2026-11-02 |

## 1. Objective

Verify the functional correctness, data consistency, usability, accessibility and basic
security of PetClinic through a maintainable, repeatable Playwright suite that never
alters pre-existing application data.

## 2. Scope

### In scope

| Module | Code | Features |
|---|---|---|
| Navigation | NAV | Navbar links and dropdowns, Home page, 404 page, direct URL access |
| Owners | OWN | List, search by last name, create, view details, edit |
| Pets | PET | Create, edit, delete (from owner details); type dropdown |
| Visits | VIS | Create, edit, delete; previous-visits list |
| Veterinarians | VET | List, create, edit (multi-specialty), delete |
| Pet Types | PTY | List, inline create, edit, delete (with confirmation) |
| Specialties | SPC | List, inline create, edit, delete |
| API | API | All endpoints the client uses (see [§6](#6-api-endpoints-under-test)) |
| Accessibility | A11Y | Keyboard navigation, accessible names, focus, axe scan |
| Responsive | RSP | Desktop, tablet, mobile layouts and the collapsed navbar |
| Security | SEC | Input handling (XSS), unauthenticated API access, error/data exposure |
| Regression | REG | Cross-entity consistency after create/update/delete |

### Out of scope

| Item | Reason |
|---|---|
| Login / logout flows, Auth0 pages | Third-party identity provider; only one test account available. Login is exercised indirectly by global setup. |
| Owner deletion via UI | Not offered by the UI (API `DELETE /owners/{id}` is used for cleanup only). |
| Load, performance, penetration testing | Shared environment; non-destructive testing only. |
| Pre-existing records | Never modified or deleted; read-only assertions only. |

## 3. Test approach

| Type | Approach | Main techniques |
|---|---|---|
| **Functional / CRUD** | UI tests per module on test-created records; verify the change in the UI **and** via API where useful | Use-case flows, state transition |
| **Positive** | Valid data for every form; successful navigation and search | Representative valid classes |
| **Negative** | Empty required fields, wrong formats, special characters, over-long values, invalid IDs, duplicates | Equivalence partitioning, error guessing |
| **Boundary values** | Name length (1 / 2 / 3 chars – min 2 enforced), telephone (9 / 10 / 11 digits – max 10), empty string, single char, very long strings, date edges (today, future, far past, leap day) | BVA |
| **UI** | Headings, labels, validation messages, button enabled/disabled state, table content, 404 page | Checklist |
| **Regression / consistency** | Renamed pet type appears in pet form and owner details; renamed specialty appears in vet list; deleted visit/pet disappears everywhere; behaviour when deleting a type/specialty in use | Cross-module scenarios |
| **API** | Status codes, response schema, invalid payloads, invalid IDs, 401 without token, UI ↔ API consistency | Contract checks with typed schemas |
| **Accessibility** | Keyboard-only navigation of navbar/forms/dropdowns, accessible names, visible focus, axe-core WCAG 2.x A/AA scan per page | Automated + targeted manual checks |
| **Cross-browser** | Smoke + core CRUD on Chromium, Firefox, WebKit | Playwright projects |
| **Responsive** | Desktop 1920×1080, tablet (iPad), mobile (Pixel / iPhone) | Playwright device descriptors |
| **Security** | XSS strings in every text input rendered as text; API rejects missing/invalid tokens (verified: 401); 4xx responses do not leak stack traces | Non-invasive only |

Every test is categorised with tags (`@smoke`, `@regression`, `@negative`, `@api`, `@a11y`,
`@security`) so subsets can be run with `--grep`.

## 4. Test data and cleanup

**Verified behaviour (Phase 1 / 2):**

* Each tester account has its own sandbox dataset. The app calls `POST /seed` on every
  full page load, but this **does not reset data** – a test-created pet type survived two
  `/seed` calls. Tests must therefore always clean up after themselves.
* Pre-existing seed data: 10 owners, 13 pets, 6 vets, 6 pet types, 3 specialties.

**Rules:**

1. Every test creates its own records named `Qa<run stamp>[Label]<random>`, letters only
   (details in [TEST-DATA.md](TEST-DATA.md)).
2. Setup data that is not under test is created **via the API** (fast, reliable); the
   feature under test is exercised **via the UI**.
3. Cleanup runs in fixtures/`afterEach` and deletes, via the API, every record the test
   registered – even when the test fails. Deletion order respects dependencies
   (visits → pets → owners).
4. Update/delete tests only touch records the test created.
5. Pre-existing records are read-only. (`tests/input-fields.spec.ts` was changed to follow
   this rule.)
6. Once per run, global setup sweeps leftovers of earlier, interrupted runs: only records
   matching the exact naming pattern with a run stamp older than the current run, in
   dependency order, with a dry-run mode (`CLEANUP_DRY_RUN=1`). Global teardown lists any
   test record still on the site. See [TEST-DATA.md](TEST-DATA.md).

## 5. Environments, browsers and viewports

| Project | Browser | Viewport | Suites |
|---|---|---|---|
| chromium (existing) | Chromium | 1920×1080 | all |
| firefox | Firefox | Desktop | smoke (`@smoke`) |
| webkit | WebKit | Desktop | smoke (`@smoke`) |
| tablet | Chromium | iPad (gen 7) | smoke, responsive (`@smoke`, `@responsive`) |
| mobile | Chromium | Pixel 7 | smoke, responsive (`@smoke`, `@responsive`) |

Global setup logs in once; all browsers reuse the same storage state. The access token is
attached **only** to the API request context (`fixtures/api.ts`), never to browser traffic.

## 6. API endpoints under test

Base: `https://petclinic-api.bondaracademy.com/petclinic/api/`. Taken from observed network
traffic and the client code; formats beyond the observed GET responses are confirmed in
Phase 4 before assertions are written.

| Resource | Endpoints |
|---|---|
| Owners | `GET /owners`, `GET /owners?lastName=`, `GET/PUT/DELETE /owners/{id}`, `POST /owners` |
| Pets | `GET /pets`, `GET/PUT/DELETE /pets/{id}`, `POST /owners/{ownerId}/pets` |
| Visits | `GET /visits`, `GET/PUT/DELETE /visits/{id}`, `POST /owners/{ownerId}/pets/{petId}/visits` |
| Vets | `GET/POST /vets`, `GET/PUT/DELETE /vets/{id}` |
| Pet types | `GET/POST /pettypes`, `GET/PUT/DELETE /pettypes/{id}` |
| Specialties | `GET/POST /specialties`, `GET/PUT/DELETE /specialties/{id}` |

Observed so far: empty owner search → 404; unknown owner ID → 404; no/invalid token → 401;
create pet type / pet → 201; delete pet type / owner → 204. Other endpoints are confirmed
in Phase 4.

## 7. Automation design

* **Page Object Model** in `pages/` – one class per page/form, locators by role/label first.
  `#id` is used only where the app gives no accessible name (documented in the page object).
* **Fixtures** in `fixtures/` – page objects, `api` client (token scoped to API host),
  data factory with automatic cleanup.
* **Test data builders** in `test-data/`; boundary and negative values as data tables to
  avoid duplicated tests.
* **Waiting:** web-first assertions only; no `waitForTimeout`. Edit forms fill in after the
  loading spinner (`role=progressbar`) disappears – page objects wait for it before reading
  values. Angular sets input values as properties, so assertions use `toHaveValue`, not
  `[value=…]` selectors.
* **Artifacts:** screenshot, trace and video retained on failure; HTML report.

```
.auth/          global setup: sign-in, saved session (user.json is git-ignored)
api/            typed API client and response types
fixtures/       test fixtures: api client (token scoped to the API host), page objects,
                data factory with automatic cleanup, knownBug() helper
pages/          page objects
support/        global sweep (before the run) and leftover check (after the run)
test-data/      unique names, builders, sweep rules
tests/          navigation/ owners/ pets/ visits/ vets/ pet-types/ specialties/
                api/ regression/ accessibility/ security/ responsive/ exploratory/
                homework.spec.ts, input-fields.spec.ts (course work, kept)
docs/           this plan, scenarios, test cases, coverage, bugs, execution report,
                traceability matrix, QA summary, jira/ (Jira import)
```

## 8. Entry and exit criteria

**Entry:** `.env` with valid credentials; application reachable; global setup succeeds.

**Exit:**
* All planned Critical and High test cases automated and executed on Chromium.
* Smoke and functional suites executed on Firefox and WebKit.
* Every failure triaged as **automation issue** (fixed) or **application defect**
  (reported in [BUG-REPORTS.md](BUG-REPORTS.md) with evidence).
* No test-created data left behind (verified by API after the run).

## 9. Priority definitions

| Priority | Meaning |
|---|---|
| Critical | Core workflow broken or data loss (owner/pet/visit creation, data consistency) |
| High | Main feature or important validation (edit flows, search, required fields) |
| Medium | Secondary behaviour (boundaries, messages, delete confirmations, API error codes) |
| Low | Cosmetic, labels, titles, minor usability |

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Shared account: parallel runs collide | Unique names per test; serial workers for now (`workers: 1`) |
| Leftover data after an aborted run | API cleanup in fixtures + prefix-based sweep before runs |
| Auth0 refresh-token rotation invalidates `.auth/user.json` | Global setup to log in again when token refresh fails (implemented in Phase 4: the token wait is registered before navigation, and a rejected saved session is retried once with a fresh login) |
| Spinner/async rendering causes flaky reads | Page objects wait for spinner to disappear; web-first assertions |
| No written requirements | Expected results come from observed behaviour and in-app consistency; open questions listed as observations, not bugs |

## 11. Deliverables

| Document | Phase |
|---|---|
| TEST-PLAN.md (this document) | 2 ✅ |
| BUG-REPORTS.md | 2 ✅ (initial 7 defects), updated in Phase 6 |
| TEST-CASES.md, TEST-COVERAGE.md | 3 ✅ |
| Automated suite | 4–5 ✅ |
| TEST-EXECUTION-REPORT.md | 6 ✅ |
| API-TESTING.md | Not created; the API cases are documented in [TEST-CASES.md § API](TEST-CASES.md#api-api) and the endpoints in [§6](#6-api-endpoints-under-test) |
| README.md update, TEST-SCENARIOS.md, TRACEABILITY-MATRIX.md, QA-SUMMARY.md, jira/ | 7 ✅ (2026-11-03) |
