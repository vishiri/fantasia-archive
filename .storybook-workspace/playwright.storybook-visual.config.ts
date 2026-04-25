import { defineConfig, devices } from '@playwright/test'

import {
  FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS,
  FANTASIA_STORYBOOK_VIEWPORT_WIDTHS
} from './.storybook/viewportBreakpoints'

export default defineConfig({
  testDir: 'visual-tests',
  testMatch: '**/*.visual.playwright.test.ts',
  timeout: 600_000,
  workers: 1,
  fullyParallel: false,
  outputDir: '../test-results/storybook-visual-artifacts',
  reporter: [
    ['list'],
    ['html', {
      outputFolder: '../test-results/storybook-visual-report',
      open: 'never'
    }]
  ],
  use: {
    /**
     * Dedicated port so Playwright's static 'http-server ./storybook-static' does not collide with
     * 'yarn storybook:run' on 6006. With 'reuseExistingServer: true', reusing 6006 would attach to
     * the dev server and leave '#storybook-root' empty for standalone iframe navigations (VRT blank).
     */
    baseURL: 'http://127.0.0.1:6007',
    viewport: {
      height: FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS.desktop,
      width: FANTASIA_STORYBOOK_VIEWPORT_WIDTHS.desktop
    },
    colorScheme: 'dark',
    timezoneId: 'UTC',
    locale: 'en-US'
  },
  webServer: {
    command: 'npx http-server ./storybook-static -p 6007 -c-1 --silent',
    url: 'http://127.0.0.1:6007',
    timeout: 120_000,
    reuseExistingServer: false
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
