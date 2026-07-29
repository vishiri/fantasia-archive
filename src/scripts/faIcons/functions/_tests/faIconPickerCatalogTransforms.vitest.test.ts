import { expect, test } from 'vitest'

import {
  faIconPickerBuildFa6CatalogFromExportKeys,
  faIconPickerBuildMaterialCatalogFromLigatures,
  faIconPickerBuildMdiCatalogFromExportKeys,
  faIconPickerCamelCaseToKebab,
  faIconPickerFa6ExportKeyToQIconName,
  faIconPickerMdiExportKeyToQIconName
} from '../faIconPickerCatalogTransforms'

/**
 * faIconPickerCamelCaseToKebab
 * Converts camelCase segments to kebab-case.
 */
test('Test that faIconPickerCamelCaseToKebab converts camelCase segments', () => {
  expect(faIconPickerCamelCaseToKebab('AccountArrowLeft')).toBe('account-arrow-left')
  expect(faIconPickerCamelCaseToKebab('42Group')).toBe('42-group')
})

/**
 * faIconPickerMdiExportKeyToQIconName
 * Maps mdi export keys to mdi-prefixed kebab names.
 */
test('Test that faIconPickerMdiExportKeyToQIconName maps mdi export keys to mdi-prefixed kebab names', () => {
  expect(faIconPickerMdiExportKeyToQIconName('mdiAccount')).toBe('mdi-account')
  expect(faIconPickerMdiExportKeyToQIconName('mdiAbTesting')).toBe('mdi-ab-testing')
})

/**
 * faIconPickerMdiExportKeyToQIconName
 * Prefix-only export key returns bare mdi.
 */
test('Test that faIconPickerMdiExportKeyToQIconName returns bare mdi for prefix-only export key', () => {
  expect(faIconPickerMdiExportKeyToQIconName('mdi')).toBe('mdi')
})

/**
 * faIconPickerMdiExportKeyToQIconName
 * Non-mdi export keys stay unchanged.
 */
test('Test that faIconPickerMdiExportKeyToQIconName returns non-mdi export keys unchanged', () => {
  expect(faIconPickerMdiExportKeyToQIconName('already-kebab')).toBe('already-kebab')
})

/**
 * faIconPickerFa6ExportKeyToQIconName
 * Maps fab, fas, and far export keys to Quasar fa class strings.
 */
test('Test that faIconPickerFa6ExportKeyToQIconName maps fab fas and far export keys', () => {
  expect(faIconPickerFa6ExportKeyToQIconName('fab42Group')).toBe('fa-brands fa-42-group')
  expect(faIconPickerFa6ExportKeyToQIconName('fasUser')).toBe('fa-solid fa-user')
  expect(faIconPickerFa6ExportKeyToQIconName('farBell')).toBe('fa-regular fa-bell')
})

/**
 * faIconPickerFa6ExportKeyToQIconName
 * Unrecognized export keys stay unchanged.
 */
test('Test that faIconPickerFa6ExportKeyToQIconName returns unrecognized export keys unchanged', () => {
  expect(faIconPickerFa6ExportKeyToQIconName('fa-solid fa-user')).toBe('fa-solid fa-user')
})

/**
 * faIconPickerBuildMdiCatalogFromExportKeys
 * Sorts transformed mdi names.
 */
test('Test that faIconPickerBuildMdiCatalogFromExportKeys sorts transformed mdi names', () => {
  expect(
    faIconPickerBuildMdiCatalogFromExportKeys([
      'mdiZebra',
      'mdiAccount'
    ])
  ).toEqual([
    'mdi-account',
    'mdi-zebra'
  ])
})

/**
 * faIconPickerBuildFa6CatalogFromExportKeys
 * Sorts transformed Font Awesome names.
 */
test('Test that faIconPickerBuildFa6CatalogFromExportKeys sorts transformed fontawesome names', () => {
  expect(
    faIconPickerBuildFa6CatalogFromExportKeys([
      'fasZ',
      'fasA'
    ])
  ).toEqual([
    'fa-solid fa-a',
    'fa-solid fa-z'
  ])
})

/**
 * faIconPickerBuildMaterialCatalogFromLigatures
 * Trims blanks and sorts ligature names.
 */
test('Test that faIconPickerBuildMaterialCatalogFromLigatures trims blanks and sorts ligature names', () => {
  expect(
    faIconPickerBuildMaterialCatalogFromLigatures([
      ' home ',
      'person',
      ''
    ])
  ).toEqual([
    'home',
    'person'
  ])
})
