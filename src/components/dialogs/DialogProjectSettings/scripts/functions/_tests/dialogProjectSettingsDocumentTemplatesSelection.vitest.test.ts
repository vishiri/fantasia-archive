import { expect, test } from 'vitest'

import { buildDialogProjectSettingsDocumentTemplateDraft } from '../../../_tests/dialogProjectSettingsDocumentTemplateDraftFixtures'
import {
  findDialogProjectSettingsNewlyAppendedDocumentTemplateId,
  isDialogProjectSettingsDocumentTemplateSelectionInvalid,
  resolveDialogProjectSettingsDocumentTemplateIdAfterRemove,
  resolveDialogProjectSettingsDocumentTemplatesPanelSelection,
  resolveDialogProjectSettingsInitialDocumentTemplateId
} from '../dialogProjectSettingsDocumentTemplatesSelection'

const templateA = buildDialogProjectSettingsDocumentTemplateDraft({
  id: '550e8400-e29b-41d4-a716-446655440000'
})

const templateB = buildDialogProjectSettingsDocumentTemplateDraft({
  id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  titleTranslations: { 'en-US': 'Location' }
})

const templateC = buildDialogProjectSettingsDocumentTemplateDraft({
  id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  titleTranslations: { 'en-US': 'Event' }
})

/**
 * resolveDialogProjectSettingsInitialDocumentTemplateId
 * Returns the first template id or null for an empty list.
 */
test('Test that resolveDialogProjectSettingsInitialDocumentTemplateId picks the first template', () => {
  expect(resolveDialogProjectSettingsInitialDocumentTemplateId([templateA, templateB])).toBe(templateA.id)
  expect(resolveDialogProjectSettingsInitialDocumentTemplateId([])).toBeNull()
})

/**
 * isDialogProjectSettingsDocumentTemplateSelectionInvalid
 * Flags null or missing ids in the current templates list.
 */
test('Test that isDialogProjectSettingsDocumentTemplateSelectionInvalid detects stale selection', () => {
  expect(isDialogProjectSettingsDocumentTemplateSelectionInvalid([templateA], null)).toBe(true)
  expect(isDialogProjectSettingsDocumentTemplateSelectionInvalid([templateA], templateB.id)).toBe(true)
  expect(isDialogProjectSettingsDocumentTemplateSelectionInvalid([templateA], templateA.id)).toBe(false)
})

/**
 * resolveDialogProjectSettingsDocumentTemplateIdAfterRemove
 * Keeps selection when another row was removed; otherwise picks a neighbor.
 */
test('Test that resolveDialogProjectSettingsDocumentTemplateIdAfterRemove selects a neighbor of the removed row', () => {
  const before = [templateA, templateB, templateC]
  const afterRemoveB = [templateA, templateC]

  expect(resolveDialogProjectSettingsDocumentTemplateIdAfterRemove(
    afterRemoveB,
    templateB.id,
    templateA.id,
    before
  )).toBe(templateA.id)

  expect(resolveDialogProjectSettingsDocumentTemplateIdAfterRemove(
    afterRemoveB,
    templateB.id,
    templateB.id,
    before
  )).toBe(templateC.id)

  expect(resolveDialogProjectSettingsDocumentTemplateIdAfterRemove(
    [templateA, templateC],
    templateB.id,
    templateB.id,
    [templateA, templateB, templateC]
  )).toBe(templateC.id)

  expect(resolveDialogProjectSettingsDocumentTemplateIdAfterRemove(
    [templateB],
    templateA.id,
    templateA.id,
    [templateA, templateB]
  )).toBe(templateB.id)
})

/**
 * findDialogProjectSettingsNewlyAppendedDocumentTemplateId
 * Detects a new id at the end after append.
 */
test('Test that findDialogProjectSettingsNewlyAppendedDocumentTemplateId returns the appended template id', () => {
  const newTemplate = buildDialogProjectSettingsDocumentTemplateDraft({
    id: '7ba7b811-9dad-11d1-80b4-00c04fd430c8',
    titleTranslations: { 'en-US': 'New template' }
  })
  const previous = [templateA, templateB]
  const next = [templateA, templateB, newTemplate]

  expect(findDialogProjectSettingsNewlyAppendedDocumentTemplateId(previous, next)).toBe(newTemplate.id)
  expect(findDialogProjectSettingsNewlyAppendedDocumentTemplateId(previous, [templateB, templateA])).toBeNull()
  expect(findDialogProjectSettingsNewlyAppendedDocumentTemplateId(previous, [])).toBeNull()
})

/**
 * resolveDialogProjectSettingsDocumentTemplateIdAfterRemove
 * Handles empty lists and stale selection when another row was removed.
 */
test('Test that resolveDialogProjectSettingsDocumentTemplateIdAfterRemove handles edge removal cases', () => {
  expect(resolveDialogProjectSettingsDocumentTemplateIdAfterRemove([], templateA.id, templateA.id, [templateA])).toBeNull()

  const before = [templateA, templateB]
  const afterRemoveB = [templateA]

  expect(resolveDialogProjectSettingsDocumentTemplateIdAfterRemove(
    afterRemoveB,
    templateB.id,
    templateC.id,
    before
  )).toBe(templateA.id)

  expect(resolveDialogProjectSettingsDocumentTemplateIdAfterRemove(
    afterRemoveB,
    'missing-id',
    templateA.id,
    before
  )).toBe(templateA.id)

  expect(resolveDialogProjectSettingsDocumentTemplateIdAfterRemove(
    [templateA],
    templateC.id,
    templateC.id,
    [templateA, templateB, templateC]
  )).toBe(templateA.id)

  expect(resolveDialogProjectSettingsDocumentTemplateIdAfterRemove(
    [templateA],
    templateB.id,
    templateB.id,
    [templateA]
  )).toBe(templateA.id)
})

/**
 * resolveDialogProjectSettingsDocumentTemplatesPanelSelection
 * Selects an appended template when add inserts at the bottom.
 */
test('Test that resolveDialogProjectSettingsDocumentTemplatesPanelSelection selects an appended template', () => {
  const newTemplate = buildDialogProjectSettingsDocumentTemplateDraft({
    id: '7ba7b811-9dad-11d1-80b4-00c04fd430c8',
    titleTranslations: { 'en-US': 'New template' }
  })

  expect(resolveDialogProjectSettingsDocumentTemplatesPanelSelection(
    [templateA, newTemplate],
    [templateA],
    templateA.id
  )).toBe(newTemplate.id)
})

/**
 * resolveDialogProjectSettingsDocumentTemplatesPanelSelection
 * Keeps a valid selection when the list changes without append or removal.
 */
test('Test that resolveDialogProjectSettingsDocumentTemplatesPanelSelection keeps a valid selection', () => {
  expect(resolveDialogProjectSettingsDocumentTemplatesPanelSelection(
    [templateA, templateB],
    [templateA, templateB],
    templateB.id
  )).toBe(templateB.id)
})

/**
 * resolveDialogProjectSettingsDocumentTemplatesPanelSelection
 * Reselects when the templates list is replaced with new ids.
 */
test('Test that resolveDialogProjectSettingsDocumentTemplatesPanelSelection reselects after replacement', () => {
  const replacement = buildDialogProjectSettingsDocumentTemplateDraft({
    id: '7ba7b811-9dad-11d1-80b4-00c04fd430c8',
    titleTranslations: { 'en-US': 'Replacement' }
  })

  expect(resolveDialogProjectSettingsDocumentTemplatesPanelSelection(
    [replacement],
    [templateA],
    templateA.id
  )).toBe(replacement.id)
})

test('Test that findDialogProjectSettingsNewlyAppendedDocumentTemplateId returns null when append is not at the end', () => {
  const insertedMiddle = buildDialogProjectSettingsDocumentTemplateDraft({
    id: '7ba7b811-9dad-11d1-80b4-00c04fd430c8',
    titleTranslations: { 'en-US': 'Inserted' }
  })

  expect(findDialogProjectSettingsNewlyAppendedDocumentTemplateId(
    [templateA, templateB],
    [templateA, insertedMiddle, templateB]
  )).toBeNull()
})

/**
 * resolveDialogProjectSettingsDocumentTemplatesPanelSelection
 * Reselects the first template when the current selection is stale.
 */
test('Test that resolveDialogProjectSettingsDocumentTemplatesPanelSelection reselects stale selection', () => {
  expect(resolveDialogProjectSettingsDocumentTemplatesPanelSelection(
    [templateB],
    [templateA, templateB],
    templateA.id
  )).toBe(templateB.id)
})
