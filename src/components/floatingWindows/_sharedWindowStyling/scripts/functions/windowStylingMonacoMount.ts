import type { I_FaMonacoMount, I_faMonacoStandaloneEditorLike } from 'app/types/I_faWindowStylingMonaco'
import type { T_injectedResult, T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export function createWindowStylingMonacoMount (deps: {
  Result: T_injectedResult
  ResultAsync: T_injectedResultAsync
  loadMonacoModule: () => Promise<{
    monaco: { editor: { create: (host: HTMLElement, opts: Record<string, unknown>) => unknown } }
  }>
  onBeforeUnmount: (hook: () => void) => void
  shallowRef: <T>(value: T) => Ref<T>
}): {
    useMonacoMount: (params: { onChange: (value: string) => void }) => I_FaMonacoMount
  } {
  function useMonacoMount (params: {
    onChange: (value: string) => void
  }): I_FaMonacoMount {
    const editor = deps.shallowRef<I_faMonacoStandaloneEditorLike | null>(null)
    const isLoading = deps.shallowRef(false)
    const loadError = deps.shallowRef<string | null>(null)
    let contentChangeDisposer: { dispose: () => void } | null = null

    function disposeEditor (): void {
      if (contentChangeDisposer !== null) {
        const disposable = contentChangeDisposer
        void deps.Result.fromThrowable(
          (): void => {
            disposable.dispose()
          },
          (): undefined => undefined
        )()
        contentChangeDisposer = null
      }
      if (editor.value !== null) {
        const disposed = editor.value
        void deps.Result.fromThrowable(
          (): void => {
            disposed.dispose()
          },
          (): undefined => undefined
        )()
        editor.value = null
      }
    }

    async function mountInto (host: HTMLElement, initialValue: string): Promise<void> {
      if (editor.value !== null) {
        editor.value.setValue(initialValue)
        return
      }
      isLoading.value = true
      loadError.value = null
      await Promise.resolve(
        deps.ResultAsync.fromPromise(
          (async (): Promise<void> => {
            const { monaco } = await deps.loadMonacoModule()
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
            }) as unknown as I_faMonacoStandaloneEditorLike
            editor.value = created
            contentChangeDisposer = created.onDidChangeModelContent(() => {
              params.onChange(created.getValue())
            })
          })(),
          (error): unknown => error
        ).match(
          () => undefined,
          (error) => {
            loadError.value = error instanceof Error ? error.message : String(error)
            console.error('[WindowStyling] Monaco load/mount failed', error)
          }
        )
      ).finally(() => {
        isLoading.value = false
      })
    }

    deps.onBeforeUnmount(() => {
      disposeEditor()
    })

    const disposeEditorOut = disposeEditor
    const editorOut = editor
    const isLoadingOut = isLoading
    const loadErrorOut = loadError
    const mountIntoOut = mountInto

    return {
      disposeEditor: disposeEditorOut,
      editor: editorOut,
      isLoading: isLoadingOut,
      loadError: loadErrorOut,
      mountInto: mountIntoOut
    }
  }

  const useMonacoMountOut = useMonacoMount

  return {
    useMonacoMount: useMonacoMountOut
  }
}
