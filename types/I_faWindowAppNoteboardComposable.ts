import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { T_faFloatingWindowResizeEdge } from 'app/types/I_faFloatingWindowResize'

/** Return shape of useWindowAppNoteboard / useWindowProjectNoteboard. */
export interface I_faWindowNoteboardComposable {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: Record<string, string | boolean>
  FA_FLOATING_WINDOW_POP_TRANSITION_MS: number
  documentNameClass: string
  frameRef: Ref<HTMLElement | null>
  frameStyleWithDialogTransition: ComputedRef<Record<string, string>>
  h: Ref<number>
  noteboardToggleKeybindLabel: ComputedRef<string | null>
  onClose: () => void
  onFramePointerDown: () => void
  onResizePointerDown: (edge: T_faFloatingWindowResizeEdge, e: PointerEvent) => void
  onTitlePointerDown: (e: PointerEvent) => void
  text: Ref<string>
  titleShortFrameClass: ComputedRef<string | undefined>
  w: Ref<number>
  windowModel: Ref<boolean>
  x: Ref<number>
  y: Ref<number>
}
