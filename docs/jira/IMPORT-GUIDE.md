# Jira CSV Import Guide – QAPORT

File: [`QAPORT-Jira-Import.csv`](QAPORT-Jira-Import.csv) (UTF-8, 211 issues, one header row).

## What the file contains

| Issue type in CSV | Count | What it is | Summary prefix | Label to filter |
|---|---|---|---|---|
| Epic | 12 | One per application area (Navigation, Owners, Pets, Visits, Veterinarians, Pet Types, Specialties, Regression, REST API, Security, Accessibility, Responsive) | area name | `qa-portfolio` |
| Story | 39 | One per feature, written as a user story. Labelled `derived-from-observed-behaviour` because the project has no written requirements | `OWN-S02 ·` | `derived-from-observed-behaviour` |
| Task | 123 | **Test cases** NAV-001 … RSP-004, with manual steps, expected and actual results, execution status, automation reference (file and line on GitHub) | `OWN-008 ·` | `test-case` |
| Bug | 17 | BUG-001 … BUG-017, the confirmed defects from `docs/BUG-REPORTS.md` | `BUG-009 ·` | `bug` |
| Task | 5 | Observations OBS-001 … OBS-005 (no requirement, not bugs) | `OBS-001 ·` | `observation` |
| Task | 1 | Test execution TE-001: the 2026-11-02 full run (209 runs, 180 passed, 29 failed as expected, 0 unexpected) | `TE-001 ·` | `test-execution` |
| Task | 14 | Recommended extra coverage REC-001 … REC-014: **not implemented, not executed** | `REC-001 ·` | `recommended-coverage` |

Hierarchy and links:
* Every Story, test case, Bug, observation and recommendation is a child of its Epic (the `Parent` column). TE-001 has no parent because it covers all areas.
* Each test case **relates to** its Story. Each Bug **relates to** the test case(s) that find it. Each observation relates to its test case(s).

Severity (on each Bug, in the description and as a label): BUG-009 → **Critical**; the others follow High → Major, Medium → Minor, Low → Trivial. The Jira **Priority** of each bug is the priority from the original report.

Priority mapping for test cases: Critical → Highest, High → High, Medium → Medium, Low → Low.

Useful labels: `exec-passed`, `exec-failed`, `exec-observation-recorded`, `exec-not-executed`, `automated`, `manual`, `exploratory`, `known-bug`, `smoke`, `module-own` (etc.), `type-negative` (etc.), `severity-critical` (etc.).

## Before you import

1. Create the project: **Projects → Create project → Software development → Scrum or Kanban → Team-managed**. Name: *Playwright Automation & Manual QA Portfolio*, key: **QAPORT** (a hyphen, as in `QA-PORT`, is not allowed in keys).
2. Check that the project has the issue types **Epic, Story, Task and Bug** (the default for a team-managed Scrum/Kanban project), and that the **Priority** field is available.
3. You need Jira admin permission for the CSV importer, and the "Link work items" permission for the links.

## Import steps

1. Open the CSV importer: **⚙ Settings → System → External system import → CSV** (on some sites it is under the project: **⋯ → Import work items**).
2. Upload `QAPORT-Jira-Import.csv`. In the advanced settings, set **File encoding: UTF-8** and **CSV delimiter: ,** (comma).
3. Choose the destination project **QAPORT**.
4. Map the fields:

   | CSV column | Jira field |
   |---|---|
   | Issue ID | **Work item id** (called *Issue ID* on older sites) |
   | Parent | **Parent** |
   | Issue Type | **Work Type** (called *Issue Type* on older sites) |
   | Summary | **Summary** |
   | Description | **Description** |
   | Priority | **Priority** |
   | Labels (all 8 columns) | **Labels** |
   | Relates (all 4 columns) | **Map to a link type → relates to** |

5. On the value-mapping screen, check that Issue Type values map to Epic / Story / Task / Bug, and Priority values map to Highest / High / Medium / Low.
6. Click **Validate**, read any warnings, then **Begin import**.
7. Afterwards open an Epic to check that its children are listed, and open a test case (e.g. `PTY-010 ·`) to check the "relates to" link to its Story and Bug.

## Good to know

* **Row order matters**: Epics come first, then the work items, so parents already exist when children are created. Don't re-sort the file.
* **Don't run the import twice**: the importer does not remove duplicates (issues or links). If something goes wrong, delete the imported issues and import once more.
* **Descriptions** are written in Jira wiki markup (headings, tables, numbered steps, links). Jira Cloud converts this to rich text during import.
* **If the Parent field is missing in the mapping step**, enable sub-tasks under **Settings → Work items → Sub-tasks** and try again (Atlassian's documented workaround).
* **Optional "Test" issue type**: test cases are imported as **Task** with the label `test-case`, so the import works without any setup. If you later add a custom issue type "Test", search `labels = test-case` and use **Bulk change → Move** to convert them.
* **No paid add-ons are needed.** Xray and Zephyr were not used.
* **Links in descriptions** point to the public GitHub repository at commit `63be3b5`, so line numbers stay correct. No credentials, tokens or private URLs are included.

## Data sources and honesty notes

* Test cases: `docs/TEST-CASES.md` and the Playwright test files (`tests/**/*.spec.ts`) at commit `63be3b5`. The steps are rewritten as manual instructions.
* Execution results: only `docs/TEST-EXECUTION-REPORT.md` (the 2026-11-02 run). Nothing was re-run. The 3 manual cases are **Not Executed**.
* Bugs: only the 17 confirmed defects in `docs/BUG-REPORTS.md`. No new bugs were created.
* Exploratory cases PET-007, VIS-011 and PTY-009: the observed values exist only in the 2026-11-02 HTML report and are not transcribed in the docs, so the Actual Results say so.
* PTY-006 carries a review note: `docs/TEST-DATA.md` says the test saves an empty pet-type name, but no bug report exists for it.
