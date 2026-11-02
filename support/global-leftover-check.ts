import { findTestRecords } from "../test-data/sweep"
import { withApi } from "./api-context"

// Global teardown: after all tests, lists every test record still on the site by type, id
// and name. Each test deletes its own records, so anything listed here points to a cleanup
// gap. Leftovers are not deleted here; the next run's sweep removes them.
async function globalLeftoverCheck(): Promise<void> {
  const log = (line: string) => console.log(`\x1b[2m\t[leftover-check] ${line}\x1b[0m`)
  const leftovers = await withApi(findTestRecords)

  if (leftovers.length === 0) {
    log("no test records left on the site")
    return
  }
  console.log(`\x1b[33m\t[leftover-check] WARNING: ${leftovers.length} test record(s) left on the site:\x1b[0m`)
  for (const record of leftovers) {
    console.log(`\x1b[33m\t  ${record.type} ${record.id} "${record.name}"${record.skipReason ? ` (sweep will skip: ${record.skipReason})` : ""}\x1b[0m`)
  }
}

export default globalLeftoverCheck
