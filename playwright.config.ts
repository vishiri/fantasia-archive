import { defineConfig } from '@playwright/test'

export default defineConfig({
  workers: 1,
  fullyParallel: false,
  testMatch: '**/*playwright.@(spec|test).?(c|m)[jt]s?(x)',
  outputDir: 'test-results/playwright-artifacts',
  expect: { timeout: 3_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/playwright-report', open: 'never' }]
  ]
})
