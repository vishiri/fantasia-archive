import 'monaco-editor/esm/vs/editor/editor.all.js'
import 'monaco-editor/esm/vs/language/css/monaco.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution.js'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker.js?worker'

import { createWindowStylingCssMonaco } from './functions/createWindowStylingCssMonaco'

const windowStylingCssMonacoApi = createWindowStylingCssMonaco({
  CssWorker,
  EditorWorker,
  getMonacoEnvironment: () =>
    (self as unknown as { MonacoEnvironment?: monaco.Environment }).MonacoEnvironment as
    | import('app/types/I_windowStylingCssMonaco').I_windowStylingMonacoEnvironment
    | undefined,
  monaco: monaco as unknown as import('app/types/I_windowStylingCssMonaco').I_windowStylingMonacoApi,
  setMonacoEnvironment: (env) => {
    (self as unknown as { MonacoEnvironment: monaco.Environment }).MonacoEnvironment =
      env as monaco.Environment
  }
})

windowStylingCssMonacoApi.configureMonacoEnvironment()

export { monaco }
