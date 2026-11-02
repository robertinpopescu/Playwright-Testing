import { defineConfig, devices } from '@playwright/test';

require('dotenv').config();

// Responsive tests (RSP) only make sense on the tablet and mobile projects
const SMOKE_AND_RESPONSIVE = /@smoke|@responsive/;

export default defineConfig({
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Run once per test run, in this order: sign in, then remove data left by earlier runs
  globalSetup: ['.auth/auth-setup.ts', './support/global-sweep.ts'],
  globalTeardown: './support/global-leftover-check.ts',
  timeout: 90000,
  use: {
    baseURL: 'https://petclinic.bondaracademy.com',
    // retries are 0, so 'on-first-retry' never recorded a trace
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: '.auth/user.json',
    // Headed by default; HEADLESS=true for unattended runs
    headless: process.env.HEADLESS === 'true',
    actionTimeout: 10000,
    viewport: {height: 1080, width: 1920}
  },

  projects: [
    {
      name: 'chromium',
      grepInvert: /@responsive/,
      use: {
        browserName: 'chromium'
      },
    },
    {
      name: 'firefox',
      grep: /@smoke/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      grep: /@smoke/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'tablet',
      grep: SMOKE_AND_RESPONSIVE,
      use: { ...devices['iPad (gen 7)'], browserName: 'chromium' },
    },
    {
      name: 'mobile',
      grep: SMOKE_AND_RESPONSIVE,
      use: { ...devices['Pixel 7'] },
    },
  ],

});
