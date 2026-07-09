import { computed } from 'vue'
import { expect, test } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import { buildProjectDocumentControlBarKeybindTooltipLabels } from '../../functions/projectDocumentControlBarKeybindTooltipLabels'

test('Test that buildProjectDocumentControlBarKeybindTooltipLabels resolves edit and save command labels', () => {
  const labels = buildProjectDocumentControlBarKeybindTooltipLabels({
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    formatFaKeybindCommandLabelFromSnapshot: ({ commandId }) => {
      if (commandId === 'editDocument') {
        return 'Ctrl + E'
      }
      if (commandId === 'saveDocumentKeepEditMode') {
        return 'Ctrl + S'
      }
      if (commandId === 'saveDocument') {
        return 'Ctrl + Alt + S'
      }
      if (commandId === 'moveDocumentTabLeft') {
        return 'Alt + Shift + Left'
      }
      if (commandId === 'moveDocumentTabRight') {
        return 'Alt + Shift + Right'
      }
      return null
    },
    getKeybindsSnapshot: () => ({
      platform: 'win32',
      store: {
        overrides: {},
        schemaVersion: 1
      }
    })
  })

  expect(labels.editDocumentKeybindLabel.value).toBe('Ctrl + E')
  expect(labels.saveDocumentKeepEditModeKeybindLabel.value).toBe('Ctrl + S')
  expect(labels.saveDocumentKeybindLabel.value).toBe('Ctrl + Alt + S')
  expect(labels.moveDocumentTabLeftKeybindLabel.value).toBe('Alt + Shift + Left')
  expect(labels.moveDocumentTabRightKeybindLabel.value).toBe('Alt + Shift + Right')
})

test('Test that buildProjectDocumentControlBarKeybindTooltipLabels returns null labels without a snapshot', () => {
  const labels = buildProjectDocumentControlBarKeybindTooltipLabels({
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null
  })

  expect(labels.editDocumentKeybindLabel.value).toBeNull()
  expect(labels.saveDocumentKeepEditModeKeybindLabel.value).toBeNull()
  expect(labels.saveDocumentKeybindLabel.value).toBeNull()
  expect(labels.moveDocumentTabLeftKeybindLabel.value).toBeNull()
  expect(labels.moveDocumentTabRightKeybindLabel.value).toBeNull()
})
