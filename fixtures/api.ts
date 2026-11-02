import { test as base, type APIRequestContext } from '@playwright/test';

export const API_BASE_URL = 'https://petclinic-api.bondaracademy.com/petclinic/api/';

// The access token is attached only to this API request context, so it is never
// sent with browser traffic to the web app, Auth0 or any third-party domain.
export const test = base.extend<{ api: APIRequestContext }>({
  api: async ({ playwright }, use) => {
    const token = process.env.ACCESS_TOKEN;
    if (!token) throw new Error('ACCESS_TOKEN is not set - did the global setup (.auth/auth-setup.ts) run?');

    const api = await playwright.request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
    await use(api);
    await api.dispose();
  }
});

export { expect } from '@playwright/test';
