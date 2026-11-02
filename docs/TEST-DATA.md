# Test Data Rules – PetClinic QA Automation

| | |
|---|---|
| **Related** | [TEST-PLAN.md §4](TEST-PLAN.md#4-test-data-and-cleanup) · [BUG-REPORTS.md](BUG-REPORTS.md) |
| **Code** | [test-data/naming.ts](../test-data/naming.ts) · [fixtures/test-data.ts](../fixtures/test-data.ts) · [test-data/sweep.ts](../test-data/sweep.ts) · [support/](../support/) |
| **Date** | 2026-11-02 (Phase 5) |

The suite runs against a shared website, under one account with its own sandbox data.
These rules make sure the tests only ever touch records they created themselves.

## 1. Naming pattern

Every record a test creates is named:

```
Qa  <run stamp>  [Label]  <random>
Qa  fuyzkqz      Type     qwerty     →  QafuyzkqzTypeqwerty
```

| Part | Format | Meaning |
|---|---|---|
| `Qa` | fixed | Marker |
| run stamp | 7 lowercase letters | Start time of the test run in seconds, written in base 26 (`a` = 0). Fixed width, so alphabetical order is chronological order. It can be decoded back to a date. |
| Label | optional; one capital + lowercase letters | What the record is for: `Type`, `Spec`, `Rex`, `Renamed`, `Edited`, `Changed`, `Crud`, `Xss` |
| random | 6 lowercase letters | Makes the name unique within a run |

* **Letters only.** Owner names reject digits, spaces, hyphens, apostrophes and accents (BUG-010), so the stamp is letters instead of digits.
* **Exact regular expression** ([test-data/naming.ts](../test-data/naming.ts)):
  `^Qa([a-z]{7})(?:[A-Z][a-z]+)?[a-z]{6}(?:<one of the known XSS payloads>)?$`
  The optional payload suffix is a short fixed list used by SEC-002, e.g. `<img src=x onerror=alert(1)>`.
* A name only counts as test data if its stamp also decodes to a time **between 2026-01-01 and now**. Names with a stamp in the future are ignored.
* **Owners and vets** are test data if the first **or** last name matches. OWN-021 keeps a matching first name while it puts `O'Brien`, `Smith-` or `Müller` into the last name.
* **Pets and visits** are test data if they belong to a test owner, or if the pet's own name matches. Tests never add pets to existing owners.
* Visit descriptions, addresses, cities and search texts are not names and use plain random letters.
* The run stamp is set once per run in global setup (`TEST_RUN_STAMP`) and inherited by every worker. All records of one run share the same stamp.

## 2. Per-test cleanup (normal case)

The `data` fixture ([fixtures/test-data.ts](../fixtures/test-data.ts)) deletes everything a test registered after the test, **also when the test failed**.

| How the record was created | How it is registered |
|---|---|
| Setup through the API (`data.owner()`, `data.pet()`, …) | Automatically, by ID |
| Owner created through the UI | `data.expectOwner(lastName)` **before** the form is submitted; IDs are looked up at cleanup |
| Pet or visit created through the UI | No registration needed: an owner is deleted together with all its pets and visits |
| Vet, specialty or pet type created through the UI | `data.watch(type)` before submitting; new records whose name is empty or matches the pattern are deleted |
| Any record from an API response | `data.track(type, id)` |

* Order: visits → pets → owners (each owner with its pets and visits) → vets → specialties → pet types.
* 404 counts as "already deleted", e.g. when the test itself deleted the record.
* Every delete is attempted even if another one fails. All failures are reported together and fail the test.

## 3. Sweep before each run

[support/global-sweep.ts](../support/global-sweep.ts) runs **once per test run**, in global setup, in the main process. It runs after sign-in and before any worker starts. It removes test records left behind by earlier runs that were interrupted (Ctrl+C, crash, killed browser).

* It deletes only records whose name matches the pattern (section 1) **and** whose run stamp is **older than the current run**.
* Pre-existing data never matches the pattern, so it is never deleted.
* Delete order: **visits → pets → owners → vets → specialties → pet types.**
* Safety guards: a matching record is **skipped** (and logged with the reason) if deleting it would change existing data.

  | Record | Skipped when | Why |
  |---|---|---|
  | Pet type | A pet that is not test data uses it | Deleting a pet type also deletes every pet of that type and their visits (BUG-009) |
  | Specialty | A vet that is not test data has it | Deleting a specialty removes it from that vet |

* Every match is logged with type, ID and name: `deleted …`, `would delete …`, `skipped …: reason` or `FAILED …`.
* If any delete fails, global setup stops the run with an error listing the records.

### Dry run

`CLEANUP_DRY_RUN=1` lists what would be deleted and deletes nothing. To run only sign-in, the sweep and the leftover check, without any test:

```bash
# Git Bash
HEADLESS=true CLEANUP_DRY_RUN=1 npx playwright test --grep "@no-such-tag" --pass-with-no-tests
```
```powershell
# PowerShell
$env:CLEANUP_DRY_RUN="1"; npx playwright test --grep "@no-such-tag" --pass-with-no-tests; Remove-Item Env:CLEANUP_DRY_RUN
```

Leave out `CLEANUP_DRY_RUN` to delete for real. Every normal `npx playwright test` also sweeps first.

## 4. Leftover check after each run

[support/global-leftover-check.ts](../support/global-leftover-check.ts) runs once in global teardown, after all tests. It lists **every** record matching the pattern (any run) by type, ID and name. It also notes records the sweep would skip.

* It does not delete anything. The next run's sweep removes leftovers.
* A leftover after a run means a cleanup gap in a test and should be investigated.
* The output appears at the end of the console run, e.g. `[leftover-check] no test records left on the site`.

## 5. Deleting through the API

| Record type | Delete via API | Notes |
|---|---|---|
| Visit | `DELETE /visits/{id}` → 204 | |
| Pet | `DELETE /pets/{id}` → 204 | Also deletes the pet's visits |
| Owner | `DELETE /owners/{id}` → 204 | **No delete in the UI.** The sweep and fixtures delete the owner's pets and visits first |
| Vet | `DELETE /vets/{id}` → 204 | |
| Specialty | `DELETE /specialties/{id}` → 204 | Also removes the specialty from vets that have it |
| Pet type | `DELETE /pettypes/{id}` → 204 | **Also deletes every pet of that type and their visits (BUG-009)**, hence the sweep guard |

**Every record type the tests create can be deleted through the API.** None needs manual cleanup. Deleting an already deleted record returns 404.

## 6. Rules for writing tests

1. Create every record with a name from `uniqueName(label)` / `ownerData()` / `petName()`. Never type a name by hand.
2. Create setup data through the API (`data.*`). Exercise only the feature under test through the UI.
3. Register UI-created records **before** the step that may fail (section 2).
4. Never edit or delete records the test did not create (seed data, other people's data). Only read them.
5. Do not run two test runs at the same time on the same account. The second run's sweep would delete the first run's records, because they are older.
6. `POST /seed` (called on every full page load) does **not** reset the data. Cleanup is always the test's job.

## 7. Known limitations

* Records created before Phase 5 used the old naming (`Qa` + 8 random letters) and are **not** matched by the sweep. On 2026-11-02 the site had none.
* A record a test renamed is still found, because renamed names also use the pattern. One exception is PTY-006, which saves a pet type with an **empty** name. If that run is interrupted before the test's own cleanup, the empty-named pet type is not matched. The leftover check does not list it, and it has to be removed by hand: Pet Types → Delete on the empty row.
* The sweep relies on the API's lists (`GET /owners`, `/pets`, `/vets`, `/specialties`, `/pettypes`). No pagination was observed.
