import type { I_faKeybindsSnapshot, T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function buildProjectAppControlBarFixedStripLeftKeybindTooltipLabels (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  formatFaKeybindCommandLabelFromSnapshot: (params: {
    commandId: T_faKeybindCommandId | undefined
    snapshot: I_faKeybindsSnapshot | null
  }) => string | null
  getKeybindsSnapshot: () => I_faKeybindsSnapshot | null
}): {
    advancedSearchGuideKeybindLabel: I_computedRef<string | null>
    keyboardShortcutsKeybindLabel: I_computedRef<string | null>
    toggleAppNoteboardKeybindLabel: I_computedRef<string | null>
    toggleHierarchyTreeKeybindLabel: I_computedRef<string | null>
    toggleProjectNoteboardKeybindLabel: I_computedRef<string | null>
  } {
  const keyboardShortcutsKeybindLabel = deps.computed(() => {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId: 'openKeybindSettings',
      snapshot: deps.getKeybindsSnapshot()
    })
  })

  const advancedSearchGuideKeybindLabel = deps.computed(() => {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId: 'openAdvancedSearchGuide',
      snapshot: deps.getKeybindsSnapshot()
    })
  })

  const toggleHierarchyTreeKeybindLabel = deps.computed(() => {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId: 'toggleHierarchicalTree',
      snapshot: deps.getKeybindsSnapshot()
    })
  })

  const toggleAppNoteboardKeybindLabel = deps.computed(() => {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId: 'toggleAppNoteboard',
      snapshot: deps.getKeybindsSnapshot()
    })
  })

  const toggleProjectNoteboardKeybindLabel = deps.computed(() => {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId: 'toggleProjectNoteboard',
      snapshot: deps.getKeybindsSnapshot()
    })
  })

  return {
    advancedSearchGuideKeybindLabel,
    keyboardShortcutsKeybindLabel,
    toggleAppNoteboardKeybindLabel,
    toggleHierarchyTreeKeybindLabel,
    toggleProjectNoteboardKeybindLabel
  }
}
