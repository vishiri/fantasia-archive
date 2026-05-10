import {
  beforeEach,
  expect,
  test,
  vi
} from 'vitest'

const { editorWorkerCtor, cssWorkerCtor } = vi.hoisted(() => {
  return {
    editorWorkerCtor: vi.fn(function MockEditorWorker () {
      return { __workerKind: 'editor' }
    } as unknown as new () => Worker),
    cssWorkerCtor: vi.fn(function MockCssWorker () {
      return { __workerKind: 'css' }
    } as unknown as new () => Worker)
  }
})

vi.mock('monaco-editor/esm/vs/editor/editor.all.js', () => ({}))
vi.mock('monaco-editor/esm/vs/language/css/monaco.contribution.js', () => ({}))
vi.mock('monaco-editor/esm/vs/basic-languages/css/css.contribution.js', () => ({}))
vi.mock('monaco-editor/esm/vs/editor/editor.api.js', () => {
  return {
    editor: {
      create: vi.fn(),
      setTheme: vi.fn()
    }
  }
})
vi.mock('monaco-editor/esm/vs/editor/editor.worker.js?worker', () => ({
  default: editorWorkerCtor
}))
vi.mock('monaco-editor/esm/vs/language/css/css.worker.js?worker', () => ({
  default: cssWorkerCtor
}))

beforeEach(() => {
  vi.resetModules()
  editorWorkerCtor.mockClear()
  cssWorkerCtor.mockClear()
  Reflect.deleteProperty(self as object, 'MonacoEnvironment')
})

interface I_TestSelf {
  MonacoEnvironment?: {
    getWorker: (workerId: string, label: string) => Worker
    __faConfigured?: boolean
  }
}

/**
 * cssMonaco
 * Importing the wrapper sets MonacoEnvironment with a getWorker that picks the css worker for css/scss/less labels and the editor worker for everything else. Idempotent on re-import.
 */
test('Test that importing cssMonaco installs a worker resolver that maps css labels to CssWorker and others to EditorWorker', async () => {
  const mod = await import('../cssMonaco')
  expect(mod.monaco).toBeDefined()

  const env = (self as unknown as I_TestSelf).MonacoEnvironment
  expect(env).toBeDefined()
  expect(env!.__faConfigured).toBe(true)

  const cssWorker = env!.getWorker('id-1', 'css')
  const scssWorker = env!.getWorker('id-2', 'scss')
  const lessWorker = env!.getWorker('id-3', 'less')
  const otherWorker = env!.getWorker('id-4', 'typescript')

  expect(cssWorkerCtor).toHaveBeenCalledTimes(3)
  expect(editorWorkerCtor).toHaveBeenCalledTimes(1)
  expect((cssWorker as unknown as { __workerKind: string }).__workerKind).toBe('css')
  expect((scssWorker as unknown as { __workerKind: string }).__workerKind).toBe('css')
  expect((lessWorker as unknown as { __workerKind: string }).__workerKind).toBe('css')
  expect((otherWorker as unknown as { __workerKind: string }).__workerKind).toBe('editor')
})

/**
 * cssMonaco
 * configureMonacoEnvironment short-circuits when the wrapper has already installed its own environment, so re-importing does not overwrite it.
 */
test('Test that configureMonacoEnvironment is idempotent across repeat imports', async () => {
  await import('../cssMonaco')
  const firstEnv = (self as unknown as I_TestSelf).MonacoEnvironment
  expect(firstEnv?.__faConfigured).toBe(true)

  vi.resetModules()
  await import('../cssMonaco')
  const secondEnv = (self as unknown as I_TestSelf).MonacoEnvironment
  expect(secondEnv).toBe(firstEnv)
})
