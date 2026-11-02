import { chromium, type FullConfig, type Page } from '@playwright/test';

const fs = require('fs').promises;
const filePath = '.auth/user.json';
const SIGN_IN_TIMEOUT = 60000;

type Cookies = Parameters<import('@playwright/test').BrowserContext['addCookies']>[0];

async function readSavedCookies(): Promise<Cookies> {
    try {
        const data = await fs.readFile(filePath);
        return JSON.parse(data).cookies ?? [];
    } catch (err: any) {
        if (err instanceof SyntaxError) {
            console.log('User auth file is not valid JSON, signing in without it');
            return [];
        }
        if (err.code === 'ENOENT') {
            console.log('User auth file does not exist, creating new file');
            await fs.writeFile(filePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
            return [];
        }
        console.error('Error processing user.json file:', err);
        throw err;
    }
}

async function fillLoginForm(page: Page) {
    if (!process.env.EMAIL || !process.env.PASSWORD) {
        throw new Error('EMAIL and PASSWORD must be set in .env (see .env-SAMPLE)');
    }
    await page.locator('#username').fill(process.env.EMAIL);
    await page.locator('#password').fill(process.env.PASSWORD);
    await page.getByRole('button', { name: 'Continue' }).click();
}

// Opens the app and returns the access token, or undefined if the token request failed
// (e.g. Auth0 rejected a stale refresh token with 403).
async function signIn(baseURL: string, storageState: string, cookies: Cookies): Promise<string | undefined> {
    const browser = await chromium.launch({ headless: true });
    try {
        const context = await browser.newContext();
        await context.addCookies(cookies);
        const page = await context.newPage();

        // Registered before navigation, so a fast token response cannot be missed
        const tokenResponse = page.waitForResponse(
            res => res.url().includes('/oauth/token') && res.request().method() === 'POST',
            { timeout: SIGN_IN_TIMEOUT }
        );
        // Marks the promise as handled: if a later step throws, its rejection on browser close
        // must not hide the real error. It is still awaited below.
        tokenResponse.catch(() => {});
        await page.goto(baseURL);

        // Either the Auth0 login form appears, or the saved session gets a token silently
        // (the losing wait is ignored: it rejects when the browser closes)
        const loginForm = page.locator('#username').waitFor({ timeout: SIGN_IN_TIMEOUT })
            .then(() => 'login', () => 'no-login-form');
        const first = await Promise.race([tokenResponse.then(() => 'token'), loginForm]);
        if (first === 'login') await fillLoginForm(page);

        const response = await tokenResponse;
        if (!response.ok()) {
            console.log(`\x1b[2m\tToken request failed with ${response.status()}\x1b[0m`);
            return undefined;
        }
        const accessToken = (await response.json()).access_token;
        if (!accessToken) return undefined;

        await page.context().storageState({ path: storageState });
        return accessToken;
    } finally {
        await browser.close();
    }
}

async function browserAuthorize(config: FullConfig){
    const { baseURL, storageState } = config.projects[0].use;
    const cookies = await readSavedCookies();

    console.log(`\x1b[2m\tSign in started to '${baseURL}'\x1b[0m`);

    let accessToken = await signIn(baseURL!, storageState as string, cookies);
    if (!accessToken && cookies.length > 0) {
        // The saved session is no longer valid: sign in again without it
        console.log(`\x1b[2m\tSaved session rejected, signing in again\x1b[0m`);
        accessToken = await signIn(baseURL!, storageState as string, []);
    }
    if (!accessToken) throw new Error('Sign in failed: no access token received');

    process.env['ACCESS_TOKEN'] = accessToken

    console.log(`\x1b[2m\tSign in processed\x1b[0m`);
}

export default browserAuthorize;
