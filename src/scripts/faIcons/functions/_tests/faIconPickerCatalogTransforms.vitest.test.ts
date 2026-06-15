import { describe, expect, test } from 'vitest'

import {
  faIconPickerBuildFa6CatalogFromExportKeys,
  faIconPickerBuildMaterialCatalogFromLigatures,
  faIconPickerBuildMdiCatalogFromExportKeys,
  faIconPickerCamelCaseToKebab,
  faIconPickerFa6ExportKeyToQIconName,
  faIconPickerMdiExportKeyToQIconName
} from '../faIconPickerCatalogTransforms'

describe('faIconPickerCamelCaseToKebab', () => {
  test('converts camelCase segments', () => {
    expect(faIconPickerCamelCaseToKebab('AccountArrowLeft')).toBe('account-arrow-left')
    expect(faIconPickerCamelCaseToKebab('42Group')).toBe('42-group')
  })
})

describe('faIconPickerMdiExportKeyToQIconName', () => {
  test('maps mdi export keys to mdi-prefixed kebab names', () => {
    expect(faIconPickerMdiExportKeyToQIconName('mdiAccount')).toBe('mdi-account')
    expect(faIconPickerMdiExportKeyToQIconName('mdiAbTesting')).toBe('mdi-ab-testing')
  })

  test('returns bare mdi for prefix-only export key', () => {
    expect(faIconPickerMdiExportKeyToQIconName('mdi')).toBe('mdi')
  })

  test('returns non-mdi export keys unchanged', () => {
    expect(faIconPickerMdiExportKeyToQIconName('already-kebab')).toBe('already-kebab')
  })
})

describe('faIconPickerFa6ExportKeyToQIconName', () => {
  test('maps fab fas and far export keys', () => {
    expect(faIconPickerFa6ExportKeyToQIconName('fab42Group')).toBe('fa-brands fa-42-group')
    expect(faIconPickerFa6ExportKeyToQIconName('fasUser')).toBe('fa-solid fa-user')
    expect(faIconPickerFa6ExportKeyToQIconName('farBell')).toBe('fa-regular fa-bell')
  })

  test('returns unrecognized export keys unchanged', () => {
    expect(faIconPickerFa6ExportKeyToQIconName('fa-solid fa-user')).toBe('fa-solid fa-user')
  })
})

describe('faIconPickerBuildMdiCatalogFromExportKeys', () => {
  test('sorts transformed mdi names', () => {
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
})

describe('faIconPickerBuildFa6CatalogFromExportKeys', () => {
  test('sorts transformed fontawesome names', () => {
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
})

describe('faIconPickerBuildMaterialCatalogFromLigatures', () => {
  test('trims blanks and sorts ligature names', () => {
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
})
