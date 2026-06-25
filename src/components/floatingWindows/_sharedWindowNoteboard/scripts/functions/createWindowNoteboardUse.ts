import type { I_faKeybindsSnapshot, T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { T_useFaFloatingWindowFrameInjected } from 'app/types/I_useFaFloatingWindowFrameInjected'
import type { I_faWindowNoteboardVariantConfig } from 'app/types/I_faWindowNoteboardVariantConfig'
import type { I_faWindowNoteboardComposable } from 'app/types/I_faWindowAppNoteboardComposable'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

export function createWindowNoteboardUse (deps: {
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
  useWindowNoteboardFramePersist: (opts: {
    h: Ref<number>
    windowModel: Ref<boolean>
    w: Ref<number>
    x: Ref<number>
    y: Ref<number>
  }) => void
  useWindowNoteboardTextPersist: (opts: {
    text: Ref<string>
    windowModel: Ref<boolean>
  }) => void
  variant: I_faWindowNoteboardVariantConfig
  wireWindowNoteboardDirectInput: (props: { directInput?: T_dialogName | undefined }) => void
}): (props: { directInput?: T_dialogName | undefined }) => I_faWindowNoteboardComposable {
  return function useWindowNoteboard (props: { directInput?: T_dialogName | undefined }) {
    const noteboardStore = deps.getNoteboardStore()
    const variant = deps.variant

    const noteboardToggleKeybindLabel = deps.computed((): string | null => {
      return deps.formatFaKeybindCommandLabelFromSnapshot({
        commandId: variant.toggleKeybindCommandId,
        snapshot: deps.getFaKeybindsStore().snapshot
      })
    })

    const windowModel = deps.storeToRefs(noteboardStore).isWindowOpen!
    const noteboardRoot = deps.storeToRefs(noteboardStore).root!
    const text = deps.storeToRefs(noteboardStore).text!

    const frame = deps.useFaFloatingWindowFrame(windowModel, undefined, {
      floatingWindowZLayer: variant.floatingWindowZLayer,
      persistedFrame: deps.computed(() => noteboardRoot.value?.frame ?? null)
    })

    deps.useWindowNoteboardFramePersist({
      h: frame.h,
      w: frame.w,
      windowModel,
      x: frame.x,
      y: frame.y
    })

    deps.useWindowNoteboardTextPersist({
      text,
      windowModel
    })
    deps.wireWindowNoteboardDirectInput(props)

    const frameStyleWithDialogTransition = deps.computed((): Record<string, string> => ({
      ...(frame.frameStyle.value as Record<string, string>),
      '--q-transition-duration': `${deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS}ms`
    }))

    function onClose (): void {
      noteboardStore.setWindowOpen(false)
    }

    return {
      FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
      FA_FLOATING_WINDOW_POP_TRANSITION_MS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS,
      documentNameClass: variant.documentNameClass,
      frameRef: frame.frameRef,
      frameStyleWithDialogTransition,
      h: frame.h,
      noteboardToggleKeybindLabel,
      onClose,
      onFramePointerDown: frame.onFramePointerDown,
      onResizePointerDown: frame.onResizePointerDown,
      onTitlePointerDown: frame.onTitlePointerDown,
      text,
      titleShortFrameClass: frame.titleShortFrameClass,
      w: frame.w,
      windowModel,
      x: frame.x,
      y: frame.y
    }
  }
}
