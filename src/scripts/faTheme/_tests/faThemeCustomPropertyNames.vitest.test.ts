import { expect, test, vi } from 'vitest'

const { faThemeScssFixture } = vi.hoisted((): { faThemeScssFixture: string } => {
  // Keep require in hoisted so the factory runs after Node builtins resolve (avoids ESM init issues).
  const { readFileSync } = require('node:fs') as typeof import('node:fs')
  const { dirname, join } = require('node:path') as typeof import('node:path')
  const { fileURLToPath } = require('node:url') as typeof import('node:url')
  const pathToFixture = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../css/fa-theme.scss'
  )
  return {
    faThemeScssFixture: readFileSync(pathToFixture, 'utf8')
  }
})

vi.mock('app/src/css/fa-theme.scss?raw', () => {
  return {
    default: faThemeScssFixture
  }
})

import {
  collectFaColorCustomPropertyNamesFromDocument
} from 'app/src/scripts/faTheme/faThemeCustomPropertyNamesFromDocument'
import {
  getFaColorCustomPropertyNamesForHelpPanel,
  parseFaColorCustomPropertyNamesFromThemeScss
} from 'app/src/scripts/faTheme/faThemeCustomPropertyNames'

/**
 * collectFaColorCustomPropertyNamesFromDocument
 * Node tests have no `document`, so the collector returns an empty list.
 */
test('Test that collectFaColorCustomPropertyNamesFromDocument returns an empty list without a document', () => {
  expect(collectFaColorCustomPropertyNamesFromDocument()).toEqual([])
})

/**
 * parseFaColorCustomPropertyNamesFromThemeScss
 * Ignores Sass directives, block edges, and deduplicates; sorts for stable UI.
 */
test('Test that parseFaColorCustomPropertyNamesFromThemeScss extracts sorted unique --fa-color- names from :root lines', () => {
  const src = [
    '@use \'sass:color\';',
    ':root {',
    '  /* x */',
    '  --fa-color-zebra: 1;',
    '  --fa-color-alpha: 2;',
    '  --fa-color-alpha: 2;',
    '  --fa-color-nested-name: 3;',
    '}',
    ''
  ].join('\n')
  expect(parseFaColorCustomPropertyNamesFromThemeScss(src)).toEqual([
    '--fa-color-alpha',
    '--fa-color-nested-name',
    '--fa-color-zebra'
  ])
})

/**
 * parseFaColorCustomPropertyNamesFromThemeScss
 * Skips lines that are not custom property assignments.
 */
test('Test that parseFaColorCustomPropertyNamesFromThemeScss ignores at-rules and non-property lines', () => {
  const src = [
    '@import \'x\';',
    '// c',
    '  }',
    '  garbage',
    ''
  ].join('\n')
  expect(parseFaColorCustomPropertyNamesFromThemeScss(src)).toEqual([])
})

/**
 * getFaColorCustomPropertyNamesForHelpPanel
 * Without a `document` (Node), uses the `?raw` parse of `fa-theme.scss` only.
 */
test('Test that getFaColorCustomPropertyNamesForHelpPanel includes common tokens from the bundled fa-theme', () => {
  const list = getFaColorCustomPropertyNamesForHelpPanel()
  expect(list.length).toBeGreaterThan(20)
  expect(list).toContain('--fa-color-accent')
  expect(list).toContain('--fa-color-primary')
  expect(list).toContain('--fa-color-tooltip-background')
})
