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
    ['line'],
    ['html', {
      outputFolder: '../test-results/storybook-visual-report',
      open: 'never'
    }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:6006',
    viewport: {
      height: FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS.desktop,
      width: FANTASIA_STORYBOOK_VIEWPORT_WIDTHS.desktop
    },
    colorScheme: 'dark',
    timezoneId: 'UTC',
    locale: 'en-US'
  },
  webServer: {
    command: 'npx http-server ./storybook-static -p 6006 -c-1 --silent',
    url: 'http://127.0.0.1:6006',
    timeout: 120_000,
    reuseExistingServer: true
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
