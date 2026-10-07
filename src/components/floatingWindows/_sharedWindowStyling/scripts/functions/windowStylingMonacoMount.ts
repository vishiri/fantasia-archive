import type { I_FaMonacoMount, I_faMonacoStandaloneEditorLike } from 'app/types/I_faWindowStylingMonaco'
import type { T_injectedResult, T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'
import type { Ref } from 'app/types/I_vueCompositionRefs'

interface I_windowStylingMonacoMountSession {
  contentChangeDisposer: { dispose: () => void } | null
  editor: Ref<I_faMonacoStandaloneEditorLike | null>
  isLoading: Ref<boolean>
  loadError: Ref<string | null>
  mountedHost: HTMLElement | null
  monacoModule: Promise<{
    monaco: { editor: { create: (host: HTMLElement, opts: Record<string, unknown>) => unknown } }
  }> | null
  mountSerial: { current: number }
  onChange: (value: string) => void
}

function loadWindowStylingMonacoModule (
  deps: {
    loadMonacoModule: () => Promise<{
      monaco: { editor: { create: (host: HTMLElement, opts: Record<string, unknown>) => unknown } }
    }>
  },
  session: I_windowStylingMonacoMountSession
): Promise<{
  monaco: { editor: { create: (host: HTMLElement, opts: Record<string, unknown>) => unknown } }
}> {
  if (session.monacoModule === null) {
    session.monacoModule = deps.loadMonacoModule().then((loaded) => loaded, (error: unknown) => {
      session.monacoModule = null
      throw error
    })
  }
  return session.monacoModule
}

function disposeWindowStylingMonacoHandle (
  Result: T_injectedResult,
  dispose: () => void
): void {
  void Result.fromThrowable(
    dispose,
    (): undefined => undefined
  )()
}

function disposeWindowStylingMonacoEditor (
  Result: T_injectedResult,
  session: I_windowStylingMonacoMountSession
): void {
  session.mountSerial.current += 1
  session.mountedHost = null
  session.isLoading.value = false
  if (session.contentChangeDisposer !== null) {
    const disposable = session.contentChangeDisposer
    disposeWindowStylingMonacoHandle(Result, () => {
      disposable.dispose()
    })
    session.contentChangeDisposer = null
  }
  if (session.editor.value !== null) {
    const disposed = session.editor.value
    disposeWindowStylingMonacoHandle(Result, () => {
      disposed.dispose()
    })
    session.editor.value = null
  }
}

async function mountWindowStylingMonacoEditor (
  deps: {
    Result: T_injectedResult
    ResultAsync: T_injectedResultAsync
    loadMonacoModule: () => Promise<{
      monaco: { editor: { create: (host: HTMLElement, opts: Record<string, unknown>) => unknown } }
    }>
  },
  session: I_windowStylingMonacoMountSession,
  host: HTMLElement,
  initialValue: string
): Promise<void> {
  if (session.editor.value !== null && session.mountedHost === host) {
    session.editor.value.setValue(initialValue)
    return
  }
  if (session.editor.value !== null) {
    disposeWindowStylingMonacoEditor(deps.Result, session)
  }
  session.mountSerial.current += 1
  const serial = session.mountSerial.current
  session.isLoading.value = true
  session.loadError.value = null
  await Promise.resolve(
    deps.ResultAsync.fromPromise(
      (async (): Promise<void> => {
        const monacoModule = await loadWindowStylingMonacoModule(deps, session)
        if (serial !== session.mountSerial.current) {
          return
        }
        const { monaco } = monacoModule
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
        if (serial !== session.mountSerial.current) {
          disposeWindowStylingMonacoHandle(deps.Result, () => {
            created.dispose()
          })
          return
        }
        session.editor.value = created
        session.mountedHost = host
        session.contentChangeDisposer = created.onDidChangeModelContent(() => {
          session.onChange(created.getValue())
        })
      })(),
      (error): unknown => error
    ).match(
      () => undefined,
      (error) => {
        if (serial !== session.mountSerial.current) {
          return
        }
        session.loadError.value = error instanceof Error ? error.message : String(error)
        console.error('[WindowStyling] Monaco load/mount failed', error)
      }
    )
  ).finally(() => {
    if (serial !== session.mountSerial.current) {
      return
    }
    session.isLoading.value = false
  })
}

function useWindowStylingMonacoMount (
  deps: {
    Result: T_injectedResult
    ResultAsync: T_injectedResultAsync
    loadMonacoModule: () => Promise<{
      monaco: { editor: { create: (host: HTMLElement, opts: Record<string, unknown>) => unknown } }
    }>
    onBeforeUnmount: (hook: () => void) => void
    shallowRef: <T>(value: T) => Ref<T>
  },
  params: { onChange: (value: string) => void }
): I_FaMonacoMount {
  const session: I_windowStylingMonacoMountSession = {
    contentChangeDisposer: null,
    editor: deps.shallowRef<I_faMonacoStandaloneEditorLike | null>(null),
    isLoading: deps.shallowRef(false),
    loadError: deps.shallowRef<string | null>(null),
    mountedHost: null,
    monacoModule: null,
    mountSerial: { current: 0 },
    onChange: params.onChange
  }
  const disposeEditor = (): void => {
    disposeWindowStylingMonacoEditor(deps.Result, session)
  }
  const mountInto = (host: HTMLElement, initialValue: string): Promise<void> => {
    return mountWindowStylingMonacoEditor(deps, session, host, initialValue)
  }

  deps.onBeforeUnmount(() => {
    disposeEditor()
  })

  const editorOut = session.editor
  const isLoadingOut = session.isLoading
  const loadErrorOut = session.loadError

  return {
    disposeEditor,
    editor: editorOut,
    isLoading: isLoadingOut,
    loadError: loadErrorOut,
    mountInto
  }
}

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
  const useMonacoMount = (params: { onChange: (value: string) => void }): I_FaMonacoMount => {
    return useWindowStylingMonacoMount(deps, params)
  }

  return {
    useMonacoMount
  }
}
