/**
 * CSS-only Monaco editor wrapper.
 *
 * Cold-loadable entrypoint imported via 'await import()' on dialog open so the editor (and its workers)
 * never reach the initial bundle. Importing 'editor.all' + the CSS language contribution + the CSS Monarch
 * tokenizer keeps the bundled worker count to two ('editor.worker' + 'css.worker') and excludes TS/HTML/JSON
 * workers and the rest of the basic-languages registry, which would otherwise pull in megabytes of unused
 * syntaxes. The two CSS contributions cover different concerns:
 *  - 'vs/language/css/monaco.contribution': worker-backed language services (validation, completion, hover,
 *    formatting, color decorators).
 *  - 'vs/basic-languages/css/css.contribution': Monarch tokenizer that produces the actual syntax colors.
 *    Without it the language is registered but every token renders as unstyled plain text.
 */
import 'monaco-editor/esm/vs/editor/editor.all.js'
import 'monaco-editor/esm/vs/language/css/monaco.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution.js'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker.js?worker'

/**
 * Configures Monaco's worker resolver for the renderer. Idempotent: re-assigning to the same factories is safe.
 * Worker bundles are emitted by Vite via the '?worker' suffix and execute under the standard Web Worker API.
 */
function configureMonacoEnvironment (): void {
  const env = (self as unknown as { MonacoEnvironment?: monaco.Environment }).MonacoEnvironment
  if (env !== undefined && (env as { __faConfigured?: boolean }).__faConfigured === true) {
    return
  }
  const next: monaco.Environment & { __faConfigured?: boolean } = {
    getWorker (_workerId: string, label: string): Worker {
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new CssWorker()
      }
      return new EditorWorker()
    },
    __faConfigured: true
  }
  ;(self as unknown as { MonacoEnvironment: monaco.Environment }).MonacoEnvironment = next
}

configureMonacoEnvironment()

export { monaco }
