import type {
  T_faWindowNoteboardFactoryApi,
  T_faWindowNoteboardFactoryDeps,
  T_faWindowNoteboardFactoryParts
} from 'app/types/I_faWindowNoteboardFactoryBind'

export function createAssembledWindowNoteboard (input: {
  computed: T_faWindowNoteboardFactoryDeps['computed']
  deps: T_faWindowNoteboardFactoryDeps
  parts: T_faWindowNoteboardFactoryParts
}): T_faWindowNoteboardFactoryApi {
  const deps = input.deps
  const variant = deps.variant

  const wireWindowNoteboardDirectInput = input.parts.createWireWindowNoteboardDirectInput({
    directInputDialogName: variant.directInputDialogName,
    getNoteboardStore: deps.getNoteboardStore,
    onMounted: deps.onMounted,
    watch: deps.watch
  })

  const useWindowNoteboardFramePersist = input.parts.createWindowNoteboardFramePersist({
    getNoteboardStore: deps.getNoteboardStore,
    persistFrameSilent: variant.persistFrameSilent,
    saveFailureActionId: variant.saveFailureActionId,
    useFaFloatingWindowFramePersist: deps.useFaFloatingWindowFramePersist
  })

  const useWindowNoteboardTextPersist = input.parts.createWindowNoteboardTextPersist({
    getNoteboardStore: deps.getNoteboardStore,
    saveFailureActionId: variant.saveFailureActionId,
    useFaFloatingWindowTextPersist: deps.useFaFloatingWindowTextPersist
  })

  const useWindowNoteboard = input.parts.createWindowNoteboardUse({
    FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
    FA_FLOATING_WINDOW_POP_TRANSITION_MS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS,
    computed: input.computed,
    formatFaKeybindCommandLabelFromSnapshot: deps.formatFaKeybindCommandLabelFromSnapshot,
    getFaKeybindsStore: deps.getFaKeybindsStore,
    getNoteboardStore: deps.getNoteboardStore,
    storeToRefs: deps.storeToRefs,
    useFaFloatingWindowFrame: deps.useFaFloatingWindowFrame,
    useWindowNoteboardFramePersist,
    useWindowNoteboardTextPersist,
    variant,
    wireWindowNoteboardDirectInput
  })

  return {
    wireWindowNoteboardDirectInput,
    useWindowNoteboardFramePersist,
    useWindowNoteboardTextPersist,
    useWindowNoteboard
  }
}
