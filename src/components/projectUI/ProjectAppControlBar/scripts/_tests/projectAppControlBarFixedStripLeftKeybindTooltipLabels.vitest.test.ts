import { computed } from 'vue'
import { expect, test, vi } from 'vitest'

import { buildProjectAppControlBarFixedStripLeftKeybindTooltipLabels } from '../../functions/projectAppControlBarFixedStripLeftKeybindTooltipLabels'

test('Test that buildProjectAppControlBarFixedStripLeftKeybindTooltipLabels resolves left strip keybind labels', () => {
  const formatFaKeybindCommandLabelFromSnapshot = vi.fn((params: {
    commandId: string | undefined
  }) => {
    return params.commandId ?? null
  })

  const labels = buildProjectAppControlBarFixedStripLeftKeybindTooltipLabels({
    computed,
    formatFaKeybindCommandLabelFromSnapshot,
    getKeybindsSnapshot: () => null
  })

  expect(labels.keyboardShortcutsKeybindLabel.value).toBe('openKeybindSettings')
  expect(labels.advancedSearchGuideKeybindLabel.value).toBe('openAdvancedSearchGuide')
  expect(labels.toggleHierarchyTreeKeybindLabel.value).toBe('toggleHierarchicalTree')
  expect(labels.toggleAppNoteboardKeybindLabel.value).toBe('toggleAppNoteboard')
  expect(labels.toggleProjectNoteboardKeybindLabel.value).toBe('toggleProjectNoteboard')
})
