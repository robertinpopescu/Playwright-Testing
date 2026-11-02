import { request } from "@playwright/test"
import { PetclinicApi } from "../api/petclinic-api"
import { API_BASE_URL } from "../fixtures/api"

// API client for global setup / teardown, which run outside the test fixtures. The token is
// set by .auth/auth-setup.ts, which runs first.
export async function withApi<T>(action: (api: PetclinicApi) => Promise<T>): Promise<T> {
  const token = process.env.ACCESS_TOKEN
  if (!token) throw new Error("ACCESS_TOKEN is not set - did .auth/auth-setup.ts run first?")
  const context = await request.newContext({ baseURL: API_BASE_URL, extraHTTPHeaders: { Authorization: `Bearer ${token}` } })
  try {
    return await action(new PetclinicApi(context))
  } finally {
    await context.dispose()
  }
}
