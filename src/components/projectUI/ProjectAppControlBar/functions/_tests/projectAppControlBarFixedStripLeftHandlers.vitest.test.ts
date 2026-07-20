import { expect, test, vi } from 'vitest'

import { buildProjectAppControlBarFixedStripLeftHandlers } from '../projectAppControlBarFixedStripLeftHandlers'

test('Test that fixed strip left handlers dispatch existing faActionManager actions', () => {
  const runFaAction = vi.fn()
  const handlers = buildProjectAppControlBarFixedStripLeftHandlers({ runFaAction })

  handlers.onKeyboardShortcutsClick()
  handlers.onAdvancedSearchGuideClick()
  handlers.onTipsTricksTriviaClick()
  handlers.onToggleHierarchyTreeClick()
  handlers.onToggleAppNoteboardClick()
  handlers.onToggleProjectNoteboardClick()

  expect(runFaAction).toHaveBeenCalledWith('openKeybindSettingsDialog', undefined)
  expect(runFaAction).toHaveBeenCalledWith('openAdvancedSearchGuideDialog', undefined)
  expect(runFaAction).toHaveBeenCalledWith('openTipsTricksTriviaDialog', undefined)
  expect(runFaAction).toHaveBeenCalledWith('toggleHierarchicalTree', undefined)
  expect(runFaAction).toHaveBeenCalledWith('toggleAppNoteboardWindow', undefined)
  expect(runFaAction).toHaveBeenCalledWith('toggleProjectNoteboardWindow', undefined)
})

test('Test that fixed strip quick search and quick add handlers are placeholders', () => {
  const runFaAction = vi.fn()
  const handlers = buildProjectAppControlBarFixedStripLeftHandlers({ runFaAction })

  handlers.onQuickSearchClick()
  handlers.onQuickAddClick()

  expect(runFaAction).not.toHaveBeenCalled()
})
