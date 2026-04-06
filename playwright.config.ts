import { defineConfig } from '@playwright/test'

/**
 * Single artifact root under 'test-results/playwright-artifacts' (sibling of the HTML report
 * folder 'test-results/playwright-report') so the reporter does not overlap project 'outputDir'.
 */
export default defineConfig({
  workers: 1,
  fullyParallel: false,
  outputDir: 'test-results/playwright-artifacts',
  testMatch: [
    '**/src/components/**/*playwright.@(spec|test).?(c|m)[jt]s?(x)',
    '**/e2e-tests/**/*playwright.@(spec|test).?(c|m)[jt]s?(x)'
  ],
  expect: { timeout: 3_000 },
  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'test-results/playwright-report',
      open: 'never'
    }]
  ]
})
