import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/** Monaco editor surface returned by useMonacoMount (window styling). */
export interface I_faMonacoStandaloneEditorLike {
  dispose: () => void
  focus: () => void
  getValue: () => string
  layout: () => void
  onDidChangeModelContent: (listener: () => void) => { dispose: () => void }
  setValue: (value: string) => void
}

/** Monaco mount composable API for app/project styling windows. */
export interface I_FaMonacoMount {
  disposeEditor: () => void
  editor: Ref<I_faMonacoStandaloneEditorLike | null>
  isLoading: Ref<boolean>
  loadError: Ref<string | null>
  mountInto: (host: HTMLElement, initialValue: string) => Promise<void>
}

/** Window styling state bundle (editor + save/close hooks). */
export interface I_FaWindowAppStylingState {
  closeWithoutSaving: () => Promise<void>
  documentName: Ref<T_dialogName>
  editorHostRef: Ref<HTMLDivElement | null>
  monaco: I_FaMonacoMount
  onWindowHide: () => void
  onWindowShow: () => Promise<void>
  saveAndCloseWindow: () => Promise<void>
  windowModel: Ref<boolean>
  workingCss: Ref<string>
}

/** Project-scoped styling window state (same shape as app styling). */
export type I_FaWindowProjectStylingState = I_FaWindowAppStylingState

export interface I_faMonacoKeybindHelpItem {
  chord: string
  labelKey: string
}

/** Minimal Monaco editor surface for post-mount value reconciliation. */
export interface I_faMonacoEditorValueSync {
  getValue: () => string
  setValue: (value: string) => void
}

/** Surface bindings for WindowAppStyling / WindowProjectStyling templates. */
export interface I_WindowAppStylingSurface {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: Record<string, string | boolean>
  FA_FLOATING_WINDOW_POP_TRANSITION_MS: number
  buildFaColorVarSwatchStyle: (cssVar: string) => Record<string, string>
  closeWithoutSaving: () => Promise<void>
  documentName: Ref<T_dialogName>
  editorHostRef: Ref<HTMLDivElement | null>
  faThemeCustomPropertyNames: Ref<readonly string[]>
  frameRef: Ref<HTMLElement | null>
  frameStyleWithDialogTransition: ComputedRef<Record<string, string>>
  helpKeybindMenuOpen: Ref<boolean>
  h: Ref<number>
  monaco: I_FaMonacoMount
  monacoKeybindHelpItems: ComputedRef<I_faMonacoKeybindHelpItem[]>
  onFramePointerDown: () => void
  onHelpIconMouseEnter: () => void
  onHelpIconMouseLeave: () => void
  onResizePointerDown: (edge: import('app/types/I_faFloatingWindowResize').T_faFloatingWindowResizeEdge, e: PointerEvent) => void
  onTitlePointerDown: (e: PointerEvent) => void
  saveAndCloseWindow: () => Promise<void>
  titleShortFrameClass: ComputedRef<string | undefined>
  w: Ref<number>
  windowModel: Ref<boolean>
  workingCss: Ref<string>
  x: Ref<number>
  y: Ref<number>
}

/** Project styling floating window template surface (same shape as app styling). */
export type I_WindowProjectStylingSurface = I_WindowAppStylingSurface
