import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'

export function buildProjectAppControlBarFixedStripLeftHandlers (input: {
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
}): {
    onAdvancedSearchGuideClick: () => void
    onKeyboardShortcutsClick: () => void
    onQuickAddClick: () => void
    onQuickSearchClick: () => void
    onTipsTricksTriviaClick: () => void
    onToggleAppNoteboardClick: () => void
    onToggleHierarchyTreeClick: () => void
    onToggleProjectNoteboardClick: () => void
  } {
  function onKeyboardShortcutsClick (): void {
    input.runFaAction('openKeybindSettingsDialog', undefined)
  }

  function onAdvancedSearchGuideClick (): void {
    input.runFaAction('openAdvancedSearchGuideDialog', undefined)
  }

  function onTipsTricksTriviaClick (): void {
    input.runFaAction('openTipsTricksTriviaDialog', undefined)
  }

  function onToggleHierarchyTreeClick (): void {
    input.runFaAction('toggleHierarchicalTree', undefined)
  }

  function onToggleAppNoteboardClick (): void {
    input.runFaAction('toggleAppNoteboardWindow', undefined)
  }

  function onToggleProjectNoteboardClick (): void {
    input.runFaAction('toggleProjectNoteboardWindow', undefined)
  }

  function onQuickSearchClick (): void {
    // Placeholder until quick-search dialog ships.
  }

  function onQuickAddClick (): void {
    // Placeholder until quick-add dialog ships.
  }

  return {
    onAdvancedSearchGuideClick,
    onKeyboardShortcutsClick,
    onQuickAddClick,
    onQuickSearchClick,
    onTipsTricksTriviaClick,
    onToggleAppNoteboardClick,
    onToggleHierarchyTreeClick,
    onToggleProjectNoteboardClick
  }
}
