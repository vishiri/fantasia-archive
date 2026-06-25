import type {
  I_faWindowStylingEditorSessionInput,
  I_faWindowStylingEditorSessionResult
} from 'app/types/I_faWindowStylingEditorSessionFactory'

export function createWindowStylingEditorSession (
  deps: I_faWindowStylingEditorSessionInput
): I_faWindowStylingEditorSessionResult {
  const monaco = deps.useMonacoMount({
    onChange (next: string): void {
      deps.workingCss.value = next
    }
  })

  function openWindow (): void {
    deps.syncWorkingCssFromStore()
    deps.windowModel.value = true
  }

  async function onWindowShow (): Promise<void> {
    if (deps.editorHostRef.value === null) {
      return
    }
    await monaco.mountInto(deps.editorHostRef.value, deps.workingCss.value)
    deps.reconcileMountedMonacoWithWorkingCss({
      editor: monaco.editor.value,
      workingCss: deps.workingCss.value
    })
  }

  function onWindowHide (): void {
    monaco.disposeEditor()
    deps.workingCss.value = ''
  }

  const monacoOut = monaco
  const onWindowHideOut = onWindowHide
  const onWindowShowOut = onWindowShow
  const openWindowOut = openWindow

  return {
    monaco: monacoOut,
    onWindowHide: onWindowHideOut,
    onWindowShow: onWindowShowOut,
    openWindow: openWindowOut
  }
}
