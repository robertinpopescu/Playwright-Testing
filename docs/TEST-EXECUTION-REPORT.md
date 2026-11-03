# Test Execution Report – PetClinic QA Automation

| | |
|---|---|
| **Application under test** | PetClinic – https://petclinic.bondaracademy.com (API: https://petclinic-api.bondaracademy.com/petclinic/api/) |
| **Run** | Full suite, all 5 projects, 2026-11-02 15:31–15:45 (UTC+2), duration 14.2 min |
| **Build under test** | Suite at commit `912ce4c` (branch `input-fields`) |
| **Result** | **209 / 209 as expected** – 180 passed, 29 expected failures (open known bugs), 0 unexpected, 0 flaky, 0 skipped |
| **Related** | [TEST-PLAN.md](TEST-PLAN.md) · [TEST-CASES.md](TEST-CASES.md) · [TEST-COVERAGE.md](TEST-COVERAGE.md) · [BUG-REPORTS.md](BUG-REPORTS.md) · [TEST-DATA.md](TEST-DATA.md) |

## 1. Summary

The full suite ran once, clean, without retries (`retries: 0`, `workers: 1`). Every test ended
with its expected status:

* **180 tests passed.**
* **29 tests failed as expected.** Each one is a known-bug test (`test.fail()` set by
  `knownBug()`) that failed at its bug assertion. Together they cover all **17 filed bugs
  (BUG-001 – BUG-017)**, and every one of them is still present.
* **No unexpected failures**, so there was nothing new to triage. No bug appears to be fixed:
  none of the known-bug tests reported "expected to fail, but passed".
* **No test data was left behind**, and the seed data was unchanged before and after the run
  (§3).

## 2. Environment and execution

| Item | Value |
|---|---|
| OS | Windows 11 Pro 10.0.22631 |
| Node.js | 24.21.0 |
| Playwright | `@playwright/test` 1.64.1 (bundled browsers), `@axe-core/playwright` 4.14.0 |
| Mode | Headless (`HEADLESS=true`), 1 worker, 0 retries, timeout 90 s / action 10 s |
| Account | Single tester account from `.env`; sign-in by global setup (`.auth/auth-setup.ts`) |
| Artifacts | Screenshot, trace and video kept on unexpected failure only (none this run); HTML report in `playwright-report/` |

Command (from the project root):

```
HEADLESS=true npx playwright test
```

For this run, the HTML and JSON reporters were also enabled, and `TEMP`/`TMP` were pointed to
a folder on drive D:, so that browser profiles stayed off drive C:, which was low on space.
Neither change affects test behaviour.

### Projects

| Project | Browser / device | Tests run | Scope |
|---|---|---|---|
| chromium | Chromium 1920×1080 | 137 | everything except `@responsive` |
| firefox | Desktop Firefox | 17 | `@smoke` |
| webkit | Desktop Safari | 17 | `@smoke` |
| tablet | iPad (gen 7), Chromium | 19 | `@smoke`, `@responsive` |
| mobile | Pixel 7, Chromium | 19 | `@smoke`, `@responsive` |
| **Total** | | **209** | 15 spec files |

## 3. Test data checks

| Check | When | Result |
|---|---|---|
| Seed data count (read-only API check) | Before the run | Owners 10/10, pets 13/13, vets 6/6, pet types 6/6, specialties 3/3 – **OK** |
| Leftover sweep (global setup, run stamp `fuyztic`) | Start of the run | 0 deleted, 0 skipped, 0 failed: no leftovers from earlier runs |
| Leftover check (global teardown) | End of the run | "no test records left on the site" |
| Seed data count + leftovers (read-only API check) | After the run | Same counts as before, 0 test records – **OK** |

The seed records are the expected ones (owners George Franklin … Carlos Estaban, vets James
Carter … Sharon Jenkins, pet types cat/dog/lizard/snake/bird/hamster, specialties
radiology/surgery/dentistry). None was changed by the run.

## 4. Results by project

| Project | Total | Passed | Expected failures (known bugs) | Unexpected | Flaky | Skipped |
|---|---|---|---|---|---|---|
| chromium | 137 | 109 | 28 | 0 | 0 | 0 |
| firefox | 17 | 17 | 0 | 0 | 0 | 0 |
| webkit | 17 | 17 | 0 | 0 | 0 | 0 |
| tablet | 19 | 19 | 0 | 0 | 0 | 0 |
| mobile | 19 | 18 | 1 (BUG-017) | 0 | 0 | 0 |
| **Total** | **209** | **180** | **29** | **0** | **0** | **0** |

## 5. Results by spec file

Counts are *tests run / of which expected failures*, per project. Paths are as they were at the time of the run: `a11y/` was renamed to `accessibility/` afterwards (commit `63be3b5`).

| Spec file | chromium | firefox | webkit | tablet | mobile |
|---|---|---|---|---|---|
| `a11y/accessibility.spec.ts` | 12 / 11 | – | – | – | – |
| `api/api.spec.ts` | 21 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |
| `exploratory/exploratory.spec.ts` | 4 / 0 | – | – | – | – |
| `homework.spec.ts` | 1 / 0 | – | – | – | – |
| `input-fields.spec.ts` | 1 / 0 | – | – | – | – |
| `navigation/navigation.spec.ts` | 7 / 1 | 3 / 0 | 3 / 0 | 3 / 0 | 3 / 0 |
| `owners/owners.spec.ts` | 30 / 5 | 4 / 0 | 4 / 0 | 4 / 0 | 4 / 0 |
| `pet-types/pet-types.spec.ts` | 9 / 1 | 2 / 0 | 2 / 0 | 2 / 0 | 2 / 0 |
| `pets/pets.spec.ts` | 13 / 3 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |
| `regression/consistency.spec.ts` | 6 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |
| `responsive/responsive.spec.ts` | – | – | – | 2 / 0 | 2 / 1 |
| `security/security.spec.ts` | 4 / 1 | – | – | – | – |
| `specialties/specialties.spec.ts` | 8 / 1 | 2 / 0 | 2 / 0 | 2 / 0 | 2 / 0 |
| `vets/vets.spec.ts` | 11 / 3 | 2 / 0 | 2 / 0 | 2 / 0 | 2 / 0 |
| `visits/visits.spec.ts` | 10 / 2 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |

The 4 exploratory tests are recording tests (`@exploratory`, see [TEST-COVERAGE.md](TEST-COVERAGE.md)).
They passed, which means their observations were recorded, not that a behaviour was confirmed.

## 6. Known bugs – status in this run

Every bug was hit by at least one test, and every one of those tests failed at its bug
assertion (the only failure allowed in a known-bug test, enforced by the `knownBugGuard`
fixture).

| Bug | Severity | Test(s) in this run | Project | Status |
|---|---|---|---|---|
| [BUG-001](BUG-REPORTS.md#bug-001) | Medium | PET-010 | chromium | Still present |
| [BUG-002](BUG-REPORTS.md#bug-002) | Medium | OWN-020 | chromium | Still present |
| [BUG-003](BUG-REPORTS.md#bug-003) | Medium | VIS-005 | chromium | Still present |
| [BUG-004](BUG-REPORTS.md#bug-004) | Medium | PET-013, VIS-009, VET-010, SPC-007 | chromium | Still present |
| [BUG-005](BUG-REPORTS.md#bug-005) | Low | PET-005, VET-005 | chromium | Still present |
| [BUG-006](BUG-REPORTS.md#bug-006) | Low | VET-006 | chromium | Still present |
| [BUG-007](BUG-REPORTS.md#bug-007) | Low | NAV-008 (every title is "Petclinic Test") | chromium | Still present |
| [BUG-008](BUG-REPORTS.md#bug-008) | Medium | SEC-004 | chromium | Still present |
| [BUG-009](BUG-REPORTS.md#bug-009) | **High** | PTY-010 | chromium | Still present |
| [BUG-010](BUG-REPORTS.md#bug-010) | Medium | OWN-021 × 4 rows (accented, apostrophe, hyphen, Unicode) | chromium | Still present |
| [BUG-011](BUG-REPORTS.md#bug-011) | Low | A11Y-001 × 8 scans | chromium | Still present |
| [BUG-012](BUG-REPORTS.md#bug-012) | Medium | A11Y-001 (`/owners`, `/pettypes`, `/specialties`, Add Pet, New Visit), A11Y-004 | chromium | Still present |
| [BUG-013](BUG-REPORTS.md#bug-013) | **High** | A11Y-002 | chromium | Still present |
| [BUG-014](BUG-REPORTS.md#bug-014) | Low | A11Y-001 (owner details) | chromium | Still present |
| [BUG-015](BUG-REPORTS.md#bug-015) | Low | A11Y-007 | chromium | Still present |
| [BUG-016](BUG-REPORTS.md#bug-016) | Low | A11Y-001 (`/owners`) | chromium | Still present |
| [BUG-017](BUG-REPORTS.md#bug-017) | Medium | RSP-002 | mobile | Still present (RSP-002 passes on tablet, as expected) |

The axe scans (A11Y-001) found no violations other than the known ones, and every known
violation was still present on its screen.

## 7. Exit criteria (TEST-PLAN §8)

| Criterion | Status |
|---|---|
| All planned Critical and High test cases automated and executed on Chromium | **Met for this run**: all 137 Chromium tests ran. Case-level coverage is tracked in [TEST-COVERAGE.md](TEST-COVERAGE.md). |
| Smoke and functional suites executed on Firefox and WebKit | **Partly met.** The smoke suite (17 tests each) ran and passed on Firefox and WebKit. By design (TEST-PLAN §5), the functional suites run on Chromium only. |
| Every failure triaged as automation issue or application defect | **Met.** 0 unexpected failures; all 29 expected failures map to filed bugs. |
| No test-created data left behind | **Met.** Confirmed by the global teardown check and by a separate API check after the run. |

## 8. Notes

* **Traces of known bugs.** Expected failures count as passed, so `retain-on-failure` kept
  no trace or video for them. To capture these, run with `VERIFY_KNOWN_BUGS=1` (see
  [BUG-REPORTS.md](BUG-REPORTS.md)). Traces are not committed because they contain the
  session token.
* **Disk space.** Drive C: had about 1.3 GB free during the run. The browsers and the user
  temp folder are on C:. Redirecting `TEMP`/`TMP` to D: kept the run's use of C: to about
  0.1 GB. If C: drops further, set `PLAYWRIGHT_BROWSERS_PATH` and `TEMP` to drive D: before
  running.
* **Run time.** The suite takes about 14 minutes with one worker. `workers: 1` is
  intentional, because all tests share one account's dataset (TEST-PLAN §10).
