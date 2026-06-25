import type { I_faKeybindsSnapshot, T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { T_useFaFloatingWindowFrameInjected } from 'app/types/I_useFaFloatingWindowFrameInjected'
import type { I_faWindowNoteboardVariantConfig } from 'app/types/I_faWindowNoteboardVariantConfig'
import type { I_faWindowNoteboardComposable } from 'app/types/I_faWindowAppNoteboardComposable'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { ComputedRef } from 'app/types/I_vueCompositionRefs'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

type T_wireWindowNoteboardDirectInput = (props: { directInput?: T_dialogName | undefined }) => void

type T_useWindowNoteboardFramePersist = (opts: {
  h: I_ref<number>
  windowModel: I_ref<boolean>
  w: I_ref<number>
  x: I_ref<number>
  y: I_ref<number>
}) => void

type T_useWindowNoteboardTextPersist = (opts: {
  text: I_ref<string>
  windowModel: I_ref<boolean>
}) => void

type T_useWindowNoteboard = (props: { directInput?: T_dialogName | undefined }) => I_faWindowNoteboardComposable

export type T_faWindowNoteboardFactoryParts = {
  createWindowNoteboardFramePersist: (deps: {
    getNoteboardStore: () => StoreGeneric
    persistFrameSilent: I_faWindowNoteboardVariantConfig['persistFrameSilent']
    saveFailureActionId: T_faActionId
    useFaFloatingWindowFramePersist: (opts: {
      debounceMs?: number | undefined
      failureActionId: T_faActionId
      h: I_ref<number>
      persistFrame: () => Promise<void>
      w: I_ref<number>
      windowModel: I_ref<boolean>
      x: I_ref<number>
      y: I_ref<number>
    }) => void
  }) => T_useWindowNoteboardFramePersist
  createWindowNoteboardTextPersist: (deps: {
    getNoteboardStore: () => StoreGeneric
    saveFailureActionId: T_faActionId
    useFaFloatingWindowTextPersist: (opts: {
      debounceMs?: number | undefined
      failureActionId: T_faActionId
      persistText: () => Promise<void>
      text: I_ref<string>
      windowModel: I_ref<boolean>
    }) => void
  }) => T_useWindowNoteboardTextPersist
  createWindowNoteboardUse: (deps: {
    FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: Record<string, string | boolean>
    FA_FLOATING_WINDOW_POP_TRANSITION_MS: number
    computed: <T>(getter: () => T) => ComputedRef<T>
    formatFaKeybindCommandLabelFromSnapshot: (input: {
      commandId: T_faKeybindCommandId | undefined
      snapshot: I_faKeybindsSnapshot | null
    }) => string | null
    getFaKeybindsStore: () => { snapshot: I_faKeybindsSnapshot | null }
    getNoteboardStore: () => StoreGeneric
    storeToRefs: T_piniaStoreToRefs
    useFaFloatingWindowFrame: T_useFaFloatingWindowFrameInjected
    useWindowNoteboardFramePersist: T_useWindowNoteboardFramePersist
    useWindowNoteboardTextPersist: T_useWindowNoteboardTextPersist
    variant: I_faWindowNoteboardVariantConfig
    wireWindowNoteboardDirectInput: T_wireWindowNoteboardDirectInput
  }) => T_useWindowNoteboard
  createWireWindowNoteboardDirectInput: (deps: {
    directInputDialogName: T_dialogName
    getNoteboardStore: () => StoreGeneric
    onMounted: (hook: () => void) => void
    watch: (
      source: () => unknown,
      effect: () => void,
      options?: Record<string, unknown> | undefined
    ) => void
  }) => T_wireWindowNoteboardDirectInput
}

export type T_faWindowNoteboardFactoryDeps = {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: Record<string, string | boolean>
  FA_FLOATING_WINDOW_POP_TRANSITION_MS: number
  computed: <T>(getter: () => T) => ComputedRef<T>
  formatFaKeybindCommandLabelFromSnapshot: (input: {
    commandId: T_faKeybindCommandId | undefined
    snapshot: I_faKeybindsSnapshot | null
  }) => string | null
  getFaKeybindsStore: () => { snapshot: I_faKeybindsSnapshot | null }
  getNoteboardStore: () => StoreGeneric
  onMounted: (hook: () => void) => void
  storeToRefs: T_piniaStoreToRefs
  useFaFloatingWindowFrame: T_useFaFloatingWindowFrameInjected
  useFaFloatingWindowFramePersist: (opts: {
    debounceMs?: number | undefined
    failureActionId: T_faActionId
    h: I_ref<number>
    persistFrame: () => Promise<void>
    w: I_ref<number>
    windowModel: I_ref<boolean>
    x: I_ref<number>
    y: I_ref<number>
  }) => void
  useFaFloatingWindowTextPersist: (opts: {
    debounceMs?: number | undefined
    failureActionId: T_faActionId
    persistText: () => Promise<void>
    text: I_ref<string>
    windowModel: I_ref<boolean>
  }) => void
  variant: I_faWindowNoteboardVariantConfig
  watch: (
    source: () => unknown,
    effect: () => void,
    options?: Record<string, unknown> | undefined
  ) => void
}

export type T_faWindowNoteboardFactoryApi = {
  wireWindowNoteboardDirectInput: T_wireWindowNoteboardDirectInput
  useWindowNoteboardFramePersist: T_useWindowNoteboardFramePersist
  useWindowNoteboardTextPersist: T_useWindowNoteboardTextPersist
  useWindowNoteboard: T_useWindowNoteboard
}
