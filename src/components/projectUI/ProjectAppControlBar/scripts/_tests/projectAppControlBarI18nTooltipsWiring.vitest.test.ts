import { computed } from 'vue'
import { expect, test, vi } from 'vitest'

import { createProjectAppControlBarI18nTooltips } from '../projectAppControlBarI18nTooltipsWiring'

test('Test that createProjectAppControlBarI18nTooltips returns translated strip tooltips', () => {
  const t = vi.fn((key: string) => key)
  const useProjectAppControlBarI18nTooltips = createProjectAppControlBarI18nTooltips({
    computed,
    useI18n: () => ({
      t
    })
  })

  const tooltips = useProjectAppControlBarI18nTooltips()

  expect(tooltips.keyboardShortcutsTooltip.value).toBe(
    'projectUI.projectAppControlBar.keyboardShortcutsTooltip'
  )
  expect(tooltips.advancedSearchGuideTooltip.value).toBe(
    'projectUI.projectAppControlBar.advancedSearchGuideTooltip'
  )
  expect(tooltips.tipsTricksTriviaTooltip.value).toBe(
    'projectUI.projectAppControlBar.tipsTricksTriviaTooltip'
  )
  expect(tooltips.toggleHierarchyTreeTooltip.value).toBe(
    'projectUI.projectAppControlBar.toggleHierarchyTreeTooltip'
  )
  expect(tooltips.toggleAppNoteboardTooltip.value).toBe(
    'projectUI.projectAppControlBar.toggleAppNoteboardTooltip'
  )
  expect(tooltips.toggleProjectNoteboardTooltip.value).toBe(
    'projectUI.projectAppControlBar.toggleProjectNoteboardTooltip'
  )
  expect(tooltips.quickSearchTooltip.value).toBe(
    'projectUI.projectAppControlBar.quickSearchTooltip'
  )
  expect(tooltips.quickAddTooltip.value).toBe(
    'projectUI.projectAppControlBar.quickAddTooltip'
  )
  expect(tooltips.deleteCurrentDocumentTooltip.value).toBe(
    'projectUI.projectAppControlBar.deleteCurrentDocumentTooltip'
  )
  expect(tooltips.editDocumentTooltip.value).toBe(
    'projectUI.projectAppControlBar.editDocumentTooltip'
  )
  expect(tooltips.copyCurrentDocumentTooltip.value).toBe(
    'projectUI.projectAppControlBar.copyCurrentDocumentTooltip'
  )
  expect(tooltips.addNewDocumentUnderThisTooltip.value).toBe(
    'projectUI.projectAppControlBar.addNewDocumentUnderThisTooltip'
  )
  expect(tooltips.saveDocumentTooltip.value).toBe(
    'projectUI.projectAppControlBar.saveDocumentTooltip'
  )
  expect(tooltips.saveDocumentKeepEditModeTooltip.value).toBe(
    'projectUI.projectAppControlBar.saveDocumentKeepEditModeTooltip'
  )
})
