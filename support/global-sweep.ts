import { decodeStamp, encodeStamp } from "../test-data/naming"
import { sweepTestData } from "../test-data/sweep"
import { withApi } from "./api-context"

// Global setup, step 2 (after .auth/auth-setup.ts). Runs once per test run in the main
// process, before any worker starts:
// 1. fixes this run's stamp, which every test name will contain (inherited by the workers)
// 2. deletes test records left behind by earlier, interrupted runs
// CLEANUP_DRY_RUN=1 only lists what would be deleted.
async function globalSweep(): Promise<void> {
  const currentStamp = encodeStamp(Date.now())
  process.env.TEST_RUN_STAMP = currentStamp
  const dryRun = process.env.CLEANUP_DRY_RUN === "1"
  const log = (line: string) => console.log(`\x1b[2m\t[sweep] ${line}\x1b[0m`)

  log(`run stamp ${currentStamp} (${new Date(decodeStamp(currentStamp)).toISOString()})${dryRun ? " - DRY RUN, nothing is deleted" : ""}`)
  const result = await withApi(api => sweepTestData(api, { currentStamp, dryRun, log }))

  const summary = dryRun
    ? `${result.matched.length - result.skipped.length} record(s) would be deleted, ${result.skipped.length} skipped`
    : `${result.deleted.length} deleted, ${result.skipped.length} skipped, ${result.failed.length} failed`
  log(`done: ${summary}`)
  if (result.failed.length > 0) {
    throw new Error(`Test data sweep could not delete: ${result.failed.map(({ record, reason }) => `${record.type}/${record.id} (${reason})`).join(", ")}`)
  }
}

export default globalSweep
