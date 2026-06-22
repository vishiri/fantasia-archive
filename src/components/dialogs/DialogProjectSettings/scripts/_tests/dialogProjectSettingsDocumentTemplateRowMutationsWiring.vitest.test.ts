import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import { buildDialogProjectSettingsDocumentTemplateDraft } from '../../_tests/dialogProjectSettingsDocumentTemplateDraftFixtures'
import {
  addDialogProjectSettingsDocumentTemplateDraftRow,
  removeDialogProjectSettingsDocumentTemplateDraftRow,
  updateDialogProjectSettingsDocumentTemplateDraftIcon,
  updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations,
  updateDialogProjectSettingsDocumentTemplateDraftWorldAppendixTranslations
} from '../dialogProjectSettingsDocumentTemplateRowMutationsWiring'

const baseTemplate = buildDialogProjectSettingsDocumentTemplateDraft({
  id: '550e8400-e29b-41d4-a716-446655440000'
})

/**
 * addDialogProjectSettingsDocumentTemplateDraftRow
 * Appends a draft row when localDocumentTemplates is hydrated.
 */
test('Test that addDialogProjectSettingsDocumentTemplateDraftRow appends a new template draft', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([baseTemplate])
  addDialogProjectSettingsDocumentTemplateDraftRow(localDocumentTemplates, 'en-US', 'New template')
  expect(localDocumentTemplates.value).toHaveLength(2)
  expect(localDocumentTemplates.value?.[0].id).toBe(baseTemplate.id)
  expect(localDocumentTemplates.value?.[1].titlePluralTranslations).toEqual({ 'en-US': 'New template' })
})

test('Test that addDialogProjectSettingsDocumentTemplateDraftRow seeds the active UI language only', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([])
  addDialogProjectSettingsDocumentTemplateDraftRow(localDocumentTemplates, 'de', 'Neue Vorlage')
  expect(localDocumentTemplates.value?.[0].titlePluralTranslations).toEqual({ de: 'Neue Vorlage' })
})

/**
 * addDialogProjectSettingsDocumentTemplateDraftRow
 * No-ops when localDocumentTemplates is still null.
 */
test('Test that addDialogProjectSettingsDocumentTemplateDraftRow no-ops when localDocumentTemplates is null', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)
  addDialogProjectSettingsDocumentTemplateDraftRow(localDocumentTemplates, 'en-US', 'New template')
  expect(localDocumentTemplates.value).toBeNull()
})

/**
 * removeDialogProjectSettingsDocumentTemplateDraftRow
 * Filters out the matching template id.
 */
test('Test that removeDialogProjectSettingsDocumentTemplateDraftRow removes the matching id', () => {
  const otherTemplate = buildDialogProjectSettingsDocumentTemplateDraft({
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    titlePluralTranslations: { 'en-US': 'Other' },
    titleSingularTranslations: {},
  })
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
 * updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations
 * Updates title translations for the matching template id.
 */
test('Test that updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations updates the matching row', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([baseTemplate])
  updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations(
    localDocumentTemplates,
    baseTemplate.id, {
      plural: { 'en-US': 'Renamed' },
      singular: {}
    }
  )
  expect(localDocumentTemplates.value?.[0].titlePluralTranslations).toEqual({ 'en-US': 'Renamed' })
})

test('Test that updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations ignores unknown ids', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([baseTemplate])
  updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations(
    localDocumentTemplates,
    'missing-id', {
      plural: { 'en-US': 'Renamed' },
      singular: {}
    }
  )
  expect(localDocumentTemplates.value?.[0].titlePluralTranslations).toEqual({ 'en-US': 'Character' })
})

/**
 * updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations
 * No-ops when localDocumentTemplates is null.
 */
test('Test that updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations no-ops when localDocumentTemplates is null', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)
  updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations(
    localDocumentTemplates,
    baseTemplate.id, {
      plural: { 'en-US': 'Renamed' },
      singular: {}
    }
  )
  expect(localDocumentTemplates.value).toBeNull()
})

/**
 * updateDialogProjectSettingsDocumentTemplateDraftWorldAppendixTranslations
 * Updates world appendix for the matching template id.
 */
test('Test that updateDialogProjectSettingsDocumentTemplateDraftWorldAppendixTranslations updates the matching row', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([baseTemplate])
  updateDialogProjectSettingsDocumentTemplateDraftWorldAppendixTranslations(localDocumentTemplates, baseTemplate.id, { 'en-US': 'Notes' })
  expect(localDocumentTemplates.value?.[0].worldAppendixTranslations).toEqual({ 'en-US': 'Notes' })
})

/**
 * updateDialogProjectSettingsDocumentTemplateDraftWorldAppendixTranslations
 * No-ops when localDocumentTemplates is null.
 */
test('Test that updateDialogProjectSettingsDocumentTemplateDraftWorldAppendixTranslations no-ops when localDocumentTemplates is null', () => {
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)
  updateDialogProjectSettingsDocumentTemplateDraftWorldAppendixTranslations(localDocumentTemplates, baseTemplate.id, { 'en-US': 'Notes' })
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
