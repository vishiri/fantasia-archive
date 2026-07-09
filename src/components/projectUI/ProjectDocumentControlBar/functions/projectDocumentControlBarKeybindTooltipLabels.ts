import type { I_faKeybindsSnapshot, T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function buildProjectDocumentControlBarKeybindTooltipLabels (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  formatFaKeybindCommandLabelFromSnapshot: (params: {
    commandId: T_faKeybindCommandId | undefined
    snapshot: I_faKeybindsSnapshot | null
  }) => string | null
  getKeybindsSnapshot: () => I_faKeybindsSnapshot | null
}): {
    editDocumentKeybindLabel: I_computedRef<string | null>
    moveDocumentTabLeftKeybindLabel: I_computedRef<string | null>
    moveDocumentTabRightKeybindLabel: I_computedRef<string | null>
    saveDocumentKeepEditModeKeybindLabel: I_computedRef<string | null>
    saveDocumentKeybindLabel: I_computedRef<string | null>
  } {
  const editDocumentKeybindLabel = deps.computed(() => {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId: 'editDocument',
      snapshot: deps.getKeybindsSnapshot()
    })
  })

  const saveDocumentKeepEditModeKeybindLabel = deps.computed(() => {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId: 'saveDocumentKeepEditMode',
      snapshot: deps.getKeybindsSnapshot()
    })
  })

  const saveDocumentKeybindLabel = deps.computed(() => {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId: 'saveDocument',
      snapshot: deps.getKeybindsSnapshot()
    })
  })

  const moveDocumentTabLeftKeybindLabel = deps.computed(() => {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId: 'moveDocumentTabLeft',
      snapshot: deps.getKeybindsSnapshot()
    })
  })

  const moveDocumentTabRightKeybindLabel = deps.computed(() => {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId: 'moveDocumentTabRight',
      snapshot: deps.getKeybindsSnapshot()
    })
  })

  return {
    editDocumentKeybindLabel,
    moveDocumentTabLeftKeybindLabel,
    moveDocumentTabRightKeybindLabel,
    saveDocumentKeepEditModeKeybindLabel,
    saveDocumentKeybindLabel
  }
}
