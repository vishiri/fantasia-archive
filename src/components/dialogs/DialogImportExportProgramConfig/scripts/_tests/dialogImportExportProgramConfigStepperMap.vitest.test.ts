/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

import { importExportViewToStepperPanel } from '../dialogImportExportProgramConfigStepperMap'

/**
 * importExportViewToStepperPanel
 */
test('Test that importExportViewToStepperPanel maps importSelect to import', () => {
  expect(importExportViewToStepperPanel('importSelect')).toBe('import')
})

/**
 * importExportViewToStepperPanel
 */
test('Test that importExportViewToStepperPanel maps export to export', () => {
  expect(importExportViewToStepperPanel('export')).toBe('export')
})

/**
 * importExportViewToStepperPanel
 */
test('Test that importExportViewToStepperPanel maps root to root', () => {
  expect(importExportViewToStepperPanel('root')).toBe('root')
})
