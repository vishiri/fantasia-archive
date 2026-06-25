import type { I_FaMonacoMount, I_faMonacoStandaloneEditorLike } from 'app/types/I_faWindowStylingMonaco'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export interface I_faWindowStylingEditorSessionInput {
  editorHostRef: Ref<HTMLDivElement | null>
  reconcileMountedMonacoWithWorkingCss: (opts: {
    editor: I_faMonacoStandaloneEditorLike | null
    workingCss: string
  }) => void
  syncWorkingCssFromStore: () => void
  useMonacoMount: (params: { onChange: (value: string) => void }) => I_FaMonacoMount
  windowModel: Ref<boolean>
  workingCss: Ref<string>
}

export interface I_faWindowStylingEditorSessionResult {
  monaco: I_FaMonacoMount
  onWindowHide: () => void
  onWindowShow: () => Promise<void>
  openWindow: () => void
}

export type T_faCreateWindowStylingEditorSession = (
  input: I_faWindowStylingEditorSessionInput
) => I_faWindowStylingEditorSessionResult
