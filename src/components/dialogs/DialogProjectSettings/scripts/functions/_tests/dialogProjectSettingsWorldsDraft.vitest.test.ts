import { expect, test } from 'vitest'

import {
  appendDialogProjectSettingsWorldDraft,
  buildDialogProjectSettingsSaveValidationTooltip,
  collectDialogProjectSettingsSaveValidationErrors,
  resolveDialogProjectSettingsWorldSaveErrorDisplayName,
  hasDialogProjectSettingsWorldColorPalleteValidationError,
  hasDialogProjectSettingsWorldNameValidationError,
  isDialogProjectSettingsDialogSaveDisabled,
  isDialogProjectSettingsWorldRemoveDisabled,
  isDialogProjectSettingsWorldTabValidationError,
  mapDialogProjectSettingsWorldsToSnapshot
} from '../dialogProjectSettingsWorldsDraft'

const baseWorld = {
  color: '',
  colorPallete: '',
  displayName: 'Realm',
  documentCount: 0,
  id: '550e8400-e29b-41d4-a716-446655440000'
}

/**
 * dialogProjectSettingsWorldsDraft
 * Save stays disabled when any world name is blank or project name is blank.
 */
test('Test that isDialogProjectSettingsDialogSaveDisabled combines project and world name rules', () => {
  expect(isDialogProjectSettingsDialogSaveDisabled('Project', [baseWorld])).toBe(false)
  expect(isDialogProjectSettingsDialogSaveDisabled('   ', [baseWorld])).toBe(true)
  expect(isDialogProjectSettingsDialogSaveDisabled('Project', [
    {
      ...baseWorld,
      displayName: '   '
    }
  ])).toBe(true)
})

/**
 * isDialogProjectSettingsDialogSaveDisabled
 * Save stays disabled when any world color_pallete repeats a hex value case-insensitively.
 */
test('Test that isDialogProjectSettingsDialogSaveDisabled rejects duplicate palette colors', () => {
  expect(isDialogProjectSettingsDialogSaveDisabled('Project', [
    {
      ...baseWorld,
      colorPallete: '#112233;#aabbcc'
    }
  ])).toBe(false)
  expect(isDialogProjectSettingsDialogSaveDisabled('Project', [
    {
      ...baseWorld,
      colorPallete: '#112233;#112233'
    }
  ])).toBe(true)
  expect(hasDialogProjectSettingsWorldColorPalleteValidationError([
    {
      ...baseWorld,
      colorPallete: '#aabbcc;#AABBCC'
    }
  ])).toBe(true)
})

/**
 * mapDialogProjectSettingsWorldsToSnapshot
 * Trims names and omits blank color from the IPC payload.
 */
test('Test that mapDialogProjectSettingsWorldsToSnapshot trims names and optional color', () => {
  expect(mapDialogProjectSettingsWorldsToSnapshot([
    {
      ...baseWorld,
      color: ' #aabbcc ',
      colorPallete: ' #112233;#445566 ',
      displayName: '  Realm  '
    }
  ])).toEqual([
    {
      color: '#aabbcc',
      colorPallete: '#112233;#445566',
      displayName: 'Realm',
      id: baseWorld.id
    }
  ])
})

/**
 * mapDialogProjectSettingsWorldsToSnapshot
 * Dedupes color_pallete segments case-insensitively before IPC.
 */
test('Test that mapDialogProjectSettingsWorldsToSnapshot dedupes duplicate palette colors', () => {
  expect(mapDialogProjectSettingsWorldsToSnapshot([
    {
      ...baseWorld,
      colorPallete: '#112233;#aabbcc;#112233'
    }
  ])).toEqual([
    {
      colorPallete: '#112233;#AABBCC',
      displayName: 'Realm',
      id: baseWorld.id
    }
  ])
})

/**
 * hasDialogProjectSettingsWorldColorPalleteValidationError
 * Treats a null worlds list as invalid.
 */
test('Test that hasDialogProjectSettingsWorldColorPalleteValidationError rejects null worlds', () => {
  expect(hasDialogProjectSettingsWorldColorPalleteValidationError(null)).toBe(true)
  expect(hasDialogProjectSettingsWorldColorPalleteValidationError([
    {
      ...baseWorld,
      colorPallete: '#112233;;#112233'
    }
  ])).toBe(true)
  expect(hasDialogProjectSettingsWorldColorPalleteValidationError([
    {
      ...baseWorld,
      colorPallete: 'bad;#112233'
    }
  ])).toBe(false)
})

/**
 * mapDialogProjectSettingsWorldsToSnapshot
 * Skips invalid palette segments while deduping valid hex values.
 */
test('Test that mapDialogProjectSettingsWorldsToSnapshot ignores invalid palette segments', () => {
  expect(mapDialogProjectSettingsWorldsToSnapshot([
    {
      ...baseWorld,
      colorPallete: 'bad;#112233;;#445566'
    }
  ])).toEqual([
    {
      colorPallete: '#112233;#445566',
      displayName: 'Realm',
      id: baseWorld.id
    }
  ])
  expect(mapDialogProjectSettingsWorldsToSnapshot([
    {
      ...baseWorld,
      colorPallete: '   '
    }
  ])).toEqual([
    {
      displayName: 'Realm',
      id: baseWorld.id
    }
  ])
})

/**
 * isDialogProjectSettingsWorldRemoveDisabled
 * Blocks delete for the last world or worlds that still have documents.
 */
test('Test that isDialogProjectSettingsWorldRemoveDisabled enforces last-world and document rules', () => {
  const worlds = [baseWorld]
  expect(isDialogProjectSettingsWorldRemoveDisabled(worlds, baseWorld)).toBe(true)

  const secondWorld = {
    ...baseWorld,
    displayName: 'Other',
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  }
  const twoWorlds = [baseWorld, secondWorld]
  expect(isDialogProjectSettingsWorldRemoveDisabled(twoWorlds, baseWorld)).toBe(false)
  expect(isDialogProjectSettingsWorldRemoveDisabled(twoWorlds, {
    ...baseWorld,
    documentCount: 2
  })).toBe(true)
})

/**
 * appendDialogProjectSettingsWorldDraft
 * Appends a new draft row with a generated id at the bottom of the list.
 */
test('Test that appendDialogProjectSettingsWorldDraft appends a new world row', () => {
  const next = appendDialogProjectSettingsWorldDraft([baseWorld], 'New world')
  expect(next).toHaveLength(2)
  expect(next[0]?.id).toBe(baseWorld.id)
  expect(next[1]?.displayName).toBe('New world')
  expect(hasDialogProjectSettingsWorldNameValidationError(next)).toBe(false)
})

/**
 * isDialogProjectSettingsWorldTabValidationError
 * Combines blank world names and duplicate palette colors for tab styling.
 */
test('Test that isDialogProjectSettingsWorldTabValidationError covers name and palette rules', () => {
  expect(isDialogProjectSettingsWorldTabValidationError(baseWorld)).toBe(false)
  expect(isDialogProjectSettingsWorldTabValidationError({
    ...baseWorld,
    displayName: '   '
  })).toBe(true)
  expect(isDialogProjectSettingsWorldTabValidationError({
    ...baseWorld,
    colorPallete: '#112233;#112233'
  })).toBe(true)
})

/**
 * resolveDialogProjectSettingsWorldSaveErrorDisplayName
 * Uses trimmed display name or the default new-world label.
 */
test('Test that resolveDialogProjectSettingsWorldSaveErrorDisplayName resolves world names', () => {
  expect(resolveDialogProjectSettingsWorldSaveErrorDisplayName('Realm Alpha', 'New world')).toBe(
    'Realm Alpha'
  )
  expect(resolveDialogProjectSettingsWorldSaveErrorDisplayName('   ', 'New world')).toBe(
    'New world'
  )
})

/**
 * collectDialogProjectSettingsSaveValidationErrors
 * Orders project name, world name, and duplicate palette errors.
 */
test('Test that collectDialogProjectSettingsSaveValidationErrors lists all blocking issues', () => {
  expect(collectDialogProjectSettingsSaveValidationErrors('Project', [baseWorld])).toEqual([])
  expect(collectDialogProjectSettingsSaveValidationErrors('   ', [baseWorld])).toEqual([
    {
      kind: 'projectNameRequired'
    }
  ])
  expect(collectDialogProjectSettingsSaveValidationErrors('Project', [
    {
      ...baseWorld,
      displayName: '   '
    }
  ])).toEqual([
    {
      kind: 'worldNameRequired',
      worldIndexOneBased: 1
    }
  ])
  expect(collectDialogProjectSettingsSaveValidationErrors('Project', [
    {
      ...baseWorld,
      colorPallete: '#112233;#112233'
    }
  ])).toEqual([
    {
      kind: 'duplicatePaletteColors',
      worldIndexOneBased: 1
    }
  ])
})

/**
 * collectDialogProjectSettingsSaveValidationErrors
 * Skips sparse array holes when iterating worlds.
 */
test('Test that collectDialogProjectSettingsSaveValidationErrors ignores undefined world slots', () => {
  const sparseWorlds = [baseWorld] as Array<typeof baseWorld | undefined>
  sparseWorlds[1] = undefined
  sparseWorlds[2] = {
    ...baseWorld,
    displayName: 'Second realm',
    id: '660e8400-e29b-41d4-a716-446655440001'
  }
  expect(collectDialogProjectSettingsSaveValidationErrors('Project', sparseWorlds as never)).toEqual([])
})

/**
 * buildDialogProjectSettingsSaveValidationTooltip
 * Joins intro line with dashed bullet lines.
 */
test('Test that buildDialogProjectSettingsSaveValidationTooltip formats multiline bullets', () => {
  const tooltip = buildDialogProjectSettingsSaveValidationTooltip(
    [
      {
        kind: 'projectNameRequired'
      },
      {
        kind: 'duplicatePaletteColors',
        worldIndexOneBased: 1
      }
    ],
    'Unable to save, following errors found:',
    (error) => {
      if (error.kind === 'projectNameRequired') {
        return 'Project name is required.'
      }
      return 'Duplicate colors found in palette of "Realm".'
    }
  )
  expect(tooltip.intro).toBe('Unable to save, following errors found:')
  expect(tooltip.bullets).toEqual([
    '- Project name is required.',
    '- Duplicate colors found in palette of "Realm".'
  ])
  expect(tooltip.flatText).toBe(
    'Unable to save, following errors found:\n' +
    '- Project name is required.\n' +
    '- Duplicate colors found in palette of "Realm".'
  )
})
