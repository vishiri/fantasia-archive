import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import {
  addDialogProjectSettingsWorldDraftRow,
  removeDialogProjectSettingsWorldDraftRow,
  updateDialogProjectSettingsWorldDraftColor,
  updateDialogProjectSettingsWorldDraftColorPallete,
  updateDialogProjectSettingsWorldDraftDisplayName
} from '../dialogProjectSettingsWorldRowMutationsWiring'

const baseWorld: I_dialogProjectSettingsWorldDraft = {
  color: '',
  colorPallete: '',
  displayName: 'Realm',
  documentCount: 0,
  id: '550e8400-e29b-41d4-a716-446655440000'
}

/**
 * addDialogProjectSettingsWorldDraftRow
 * Appends a draft row when localWorlds is hydrated.
 */
test('Test that addDialogProjectSettingsWorldDraftRow appends a new world draft', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([baseWorld])
  addDialogProjectSettingsWorldDraftRow(localWorlds, 'New World')
  expect(localWorlds.value).toHaveLength(2)
  expect(localWorlds.value?.[0].id).toBe(baseWorld.id)
  expect(localWorlds.value?.[1].displayName).toBe('New World')
})

/**
 * addDialogProjectSettingsWorldDraftRow
 * No-ops when localWorlds is still null.
 */
test('Test that addDialogProjectSettingsWorldDraftRow no-ops when localWorlds is null', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  addDialogProjectSettingsWorldDraftRow(localWorlds, 'New World')
  expect(localWorlds.value).toBeNull()
})

/**
 * removeDialogProjectSettingsWorldDraftRow
 * Filters out the matching world id.
 */
test('Test that removeDialogProjectSettingsWorldDraftRow removes the matching id', () => {
  const otherWorld: I_dialogProjectSettingsWorldDraft = {
    color: '',
    colorPallete: '',
    displayName: 'Other',
    documentCount: 0,
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  }
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([baseWorld, otherWorld])
  removeDialogProjectSettingsWorldDraftRow(localWorlds, baseWorld.id)
  expect(localWorlds.value?.map((world) => world.id)).toEqual([otherWorld.id])
})

/**
 * removeDialogProjectSettingsWorldDraftRow
 * No-ops when localWorlds is null.
 */
test('Test that removeDialogProjectSettingsWorldDraftRow no-ops when localWorlds is null', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  removeDialogProjectSettingsWorldDraftRow(localWorlds, baseWorld.id)
  expect(localWorlds.value).toBeNull()
})

/**
 * updateDialogProjectSettingsWorldDraftDisplayName
 * Updates the display name for the matching world id.
 */
test('Test that updateDialogProjectSettingsWorldDraftDisplayName updates the matching row', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([baseWorld])
  updateDialogProjectSettingsWorldDraftDisplayName(localWorlds, baseWorld.id, 'Renamed')
  expect(localWorlds.value?.[0].displayName).toBe('Renamed')
})

/**
 * updateDialogProjectSettingsWorldDraftDisplayName
 * No-ops when localWorlds is null.
 */
test('Test that updateDialogProjectSettingsWorldDraftDisplayName no-ops when localWorlds is null', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  updateDialogProjectSettingsWorldDraftDisplayName(localWorlds, baseWorld.id, 'Renamed')
  expect(localWorlds.value).toBeNull()
})

/**
 * updateDialogProjectSettingsWorldDraftColor
 * Updates the color for the matching world id.
 */
test('Test that updateDialogProjectSettingsWorldDraftColor updates the matching row', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([baseWorld])
  updateDialogProjectSettingsWorldDraftColor(localWorlds, baseWorld.id, '#aabbcc')
  expect(localWorlds.value?.[0].color).toBe('#aabbcc')
})

/**
 * updateDialogProjectSettingsWorldDraftColor
 * No-ops when localWorlds is null.
 */
test('Test that updateDialogProjectSettingsWorldDraftColor no-ops when localWorlds is null', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  updateDialogProjectSettingsWorldDraftColor(localWorlds, baseWorld.id, '#aabbcc')
  expect(localWorlds.value).toBeNull()
})

/**
 * updateDialogProjectSettingsWorldDraftColorPallete
 * Updates the color palette for the matching world id.
 */
test('Test that updateDialogProjectSettingsWorldDraftColorPallete updates the matching row', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([baseWorld])
  updateDialogProjectSettingsWorldDraftColorPallete(localWorlds, baseWorld.id, '#112233;#445566')
  expect(localWorlds.value?.[0].colorPallete).toBe('#112233;#445566')
})

/**
 * updateDialogProjectSettingsWorldDraftColorPallete
 * No-ops when localWorlds is null.
 */
test('Test that updateDialogProjectSettingsWorldDraftColorPallete no-ops when localWorlds is null', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  updateDialogProjectSettingsWorldDraftColorPallete(localWorlds, baseWorld.id, '#112233')
  expect(localWorlds.value).toBeNull()
})
