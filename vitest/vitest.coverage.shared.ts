/**
 * Shared Vitest v8 coverage defaults so each project only reports files it is meant to cover.
 * Without scoped 'include', v8 counts every imported file (and even package.json JSON imports), which drags down or confuses percentages.
 */

/**
 * When true, the text coverage table omits per-file rows where statements, branches, and functions are all 100%.
 */
export const vitestCoverageSkipFull = true

/**
 * Enforced when Vitest runs with '--coverage' on unit-electron, unit-helpers, unit-i18n, unit-src-renderer,
 * and on **.ts** / **.vue** files under unit-components (see vitest.*.config.mts in this folder).
 * Each instrumented file must meet: 95% statements, 80% branches, 100% functions, 95% lines (**perFile: true**).
 * **`coverage.watermarks`** in **`vitest.components.config.mts`** flag weak per-file totals for review.
 */
export const vitestCoverageStrictThresholds = {
  statements: 95,
  branches: 80,
  functions: 100,
  lines: 95
} as const

export const vitestCoverageStrictThresholdsPerFile = {
  perFile: true,
  ...vitestCoverageStrictThresholds
} as const

export const vitestCoverageBaseExclude = [
  '**/node_modules/**',
  '**/.quasar/**',
  '**/dist/**',
  '**/coverage/**',
  '**/*.vitest.test.ts',
  '**/*.d.ts',
  '**/e2e-tests/**',
  '**/.storybook-workspace/**',
  '**/storybook-static/**',
  'src-electron/electron-main.ts'
] as const
