import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import {
  addDialogProjectSettingsDocumentTemplateDraftRow,
  removeDialogProjectSettingsDocumentTemplateDraftRow,
  updateDialogProjectSettingsDocumentTemplateDraftDisplayName,
  updateDialogProjectSettingsDocumentTemplateDraftIcon,
  updateDialogProjectSettingsDocumentTemplateDraftWorldAppendix
} from '../dialogProjectSettingsDocumentTemplateRowMutationsWiring'

const baseTemplate: I_dialogProjectSettingsDocumentTemplateDraft = {
  displayName: 'Character',
  documentCount: 0,
  icon: '',
  id: '550e8400-e29b-41d4-a716-446655440000',
  worldAppendix: ''
}

/**
 * addDialogProjectSettingsDocumentTemplateDraftRow
 * Appends a draft row when localDocumentTemplates is hydrated.
 */
test('Test that addDialogProjectSettingsDocumentTemplateDraftRow appends a new template draft', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([baseTemplate])
  addDialogProjectSettingsDocumentTemplateDraftRow(localDocumentTemplates, 'New template')
  expect(localDocumentTemplates.value).toHaveLength(2)
  expect(localDocumentTemplates.value?.[0].id).toBe(baseTemplate.id)
  expect(localDocumentTemplates.value?.[1].displayName).toBe('New template')
})

/**
 * addDialogProjectSettingsDocumentTemplateDraftRow
 * No-ops when localDocumentTemplates is still null.
 */
test('Test that addDialogProjectSettingsDocumentTemplateDraftRow no-ops when localDocumentTemplates is null', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)
  addDialogProjectSettingsDocumentTemplateDraftRow(localDocumentTemplates, 'New template')
  expect(localDocumentTemplates.value).toBeNull()
})

/**
 * removeDialogProjectSettingsDocumentTemplateDraftRow
 * Filters out the matching template id.
 */
test('Test that removeDialogProjectSettingsDocumentTemplateDraftRow removes the matching id', () => {
  const otherTemplate: I_dialogProjectSettingsDocumentTemplateDraft = {
    displayName: 'Other',
    documentCount: 0,
    icon: '',
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    worldAppendix: ''
  }
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([
    baseTemplate,
    otherTemplate
  ])
  removeDialogProjectSettingsDocumentTemplateDraftRow(localDocumentTemplates, baseTemplate.id)
  expect(localDocumentTemplates.value?.map((template) => template.id)).toEqual([otherTemplate.id])
})

/**
 * removeDialogProjectSettingsDocumentTemplateDraftRow
 * No-ops when localDocumentTemplates is null.
 */
test('Test that removeDialogProjectSettingsDocumentTemplateDraftRow no-ops when localDocumentTemplates is null', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)
  removeDialogProjectSettingsDocumentTemplateDraftRow(localDocumentTemplates, baseTemplate.id)
  expect(localDocumentTemplates.value).toBeNull()
})

/**
 * updateDialogProjectSettingsDocumentTemplateDraftDisplayName
 * Updates the display name for the matching template id.
 */
test('Test that updateDialogProjectSettingsDocumentTemplateDraftDisplayName updates the matching row', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([baseTemplate])
  updateDialogProjectSettingsDocumentTemplateDraftDisplayName(localDocumentTemplates, baseTemplate.id, 'Renamed')
  expect(localDocumentTemplates.value?.[0].displayName).toBe('Renamed')
})

/**
 * updateDialogProjectSettingsDocumentTemplateDraftDisplayName
 * No-ops when localDocumentTemplates is null.
 */
test('Test that updateDialogProjectSettingsDocumentTemplateDraftDisplayName no-ops when localDocumentTemplates is null', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)
  updateDialogProjectSettingsDocumentTemplateDraftDisplayName(localDocumentTemplates, baseTemplate.id, 'Renamed')
  expect(localDocumentTemplates.value).toBeNull()
})

/**
 * updateDialogProjectSettingsDocumentTemplateDraftWorldAppendix
 * Updates world appendix for the matching template id.
 */
test('Test that updateDialogProjectSettingsDocumentTemplateDraftWorldAppendix updates the matching row', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([baseTemplate])
  updateDialogProjectSettingsDocumentTemplateDraftWorldAppendix(localDocumentTemplates, baseTemplate.id, 'Notes')
  expect(localDocumentTemplates.value?.[0].worldAppendix).toBe('Notes')
})

/**
 * updateDialogProjectSettingsDocumentTemplateDraftWorldAppendix
 * No-ops when localDocumentTemplates is null.
 */
test('Test that updateDialogProjectSettingsDocumentTemplateDraftWorldAppendix no-ops when localDocumentTemplates is null', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)
  updateDialogProjectSettingsDocumentTemplateDraftWorldAppendix(localDocumentTemplates, baseTemplate.id, 'Notes')
  expect(localDocumentTemplates.value).toBeNull()
})

/**
 * updateDialogProjectSettingsDocumentTemplateDraftIcon
 * Updates icon for the matching template id.
 */
test('Test that updateDialogProjectSettingsDocumentTemplateDraftIcon updates the matching row', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([baseTemplate])
  updateDialogProjectSettingsDocumentTemplateDraftIcon(localDocumentTemplates, baseTemplate.id, 'person')
  expect(localDocumentTemplates.value?.[0].icon).toBe('person')
})

/**
 * updateDialogProjectSettingsDocumentTemplateDraftIcon
 * No-ops when localDocumentTemplates is null.
 */
test('Test that updateDialogProjectSettingsDocumentTemplateDraftIcon no-ops when localDocumentTemplates is null', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)
  updateDialogProjectSettingsDocumentTemplateDraftIcon(localDocumentTemplates, baseTemplate.id, 'person')
  expect(localDocumentTemplates.value).toBeNull()
})
