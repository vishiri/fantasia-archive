import type { Ref } from 'vue'
import { onBeforeUnmount, shallowRef } from 'vue'

/**
 * Lightweight subset of the Monaco standalone editor surface used by 'DialogProgramStyling'.
 * The full Monaco type tree is huge and only available after dynamic import; declaring this locally
 * keeps the renderer free of Monaco type imports unless the dialog is actually opened.
 */
interface I_FaMonacoStandaloneEditorLike {
  dispose: () => void
  getValue: () => string
  setValue: (value: string) => void
  onDidChangeModelContent: (listener: () => void) => { dispose: () => void }
  layout: () => void
  focus: () => void
}

/**
 * Reactive state and disposables tracked by 'useMonacoMount'.
 */
export interface I_FaMonacoMount {
  editor: Ref<I_FaMonacoStandaloneEditorLike | null>
  isLoading: Ref<boolean>
  loadError: Ref<string | null>
  mountInto: (host: HTMLElement, initialValue: string) => Promise<void>
  disposeEditor: () => void
}

/**
 * Cold-loads the Monaco wrapper, mounts a CSS-only editor instance into 'host', and wires it to the
 * caller-provided 'onChange' so a working copy can mirror the editor contents without reading from
 * Monaco on every keystroke.
 *
 * Lifecycle: 'mountInto' must be called once after the host '<div>' is rendered (typically in the
 * dialog's '@show' callback). 'disposeEditor' is invoked automatically on component unmount and on
 * dialog hide; calling it more than once is safe.
 */
export function useMonacoMount (params: {
  onChange: (value: string) => void
}): I_FaMonacoMount {
  const editor = shallowRef<I_FaMonacoStandaloneEditorLike | null>(null)
  const isLoading = shallowRef(false)
  const loadError = shallowRef<string | null>(null)
  let contentChangeDisposer: { dispose: () => void } | null = null

  function disposeEditor (): void {
    if (contentChangeDisposer !== null) {
      try {
        contentChangeDisposer.dispose()
      } catch {
        // Monaco swallows disposal errors at teardown; nothing actionable for the UI.
      }
      contentChangeDisposer = null
    }
    if (editor.value !== null) {
      try {
        editor.value.dispose()
      } catch {
        // Same rationale as above.
      }
      editor.value = null
    }
  }

  async function mountInto (host: HTMLElement, initialValue: string): Promise<void> {
    if (editor.value !== null) {
      // Reuse the existing instance, just refresh the contents.
      editor.value.setValue(initialValue)
      return
    }
    isLoading.value = true
    loadError.value = null
    try {
      const wrapper = await import('app/src/components/dialogs/DialogProgramStyling/scripts/cssMonaco')
      const { monaco } = wrapper
      const created = monaco.editor.create(host, {
        value: initialValue,
        language: 'css',
        automaticLayout: true,
        minimap: { enabled: false },
        theme: 'vs-dark',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        fontSize: 13
      }) as unknown as I_FaMonacoStandaloneEditorLike
      editor.value = created
      contentChangeDisposer = created.onDidChangeModelContent(() => {
        params.onChange(created.getValue())
      })
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : String(error)
      console.error('[DialogProgramStyling] Monaco load/mount failed', error)
    } finally {
      isLoading.value = false
    }
  }

  onBeforeUnmount(() => {
    disposeEditor()
  })

  return {
    disposeEditor,
    editor,
    isLoading,
    loadError,
    mountInto
  }
}
