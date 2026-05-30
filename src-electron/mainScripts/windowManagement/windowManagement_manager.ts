import { fileURLToPath } from 'node:url'

import { pickElectronMainScriptFromArgv } from './functions/resolveFaElectronMainJsPath'
import { createResolveFaElectronMainJsPathApi } from './functions/resolveFaElectronMainJsPathApi'

export {
  appWindow,
  assignAppWindowRefForTesting,
  mainWindowCreation,
  preventSecondaryAppInstance
} from './mainWindowCreationWiring'

export { applyFaSpellCheckerLanguagesToSession } from './faSpellCheckerSessionWiring'

export { registerFaMainWindowWebContentsSessionReset } from './faMainWindowWebContentsSessionResetWiring'

export { setupSpellChecker } from './spellCheckerWiring'

export const resolveFaElectronMainJsPath = createResolveFaElectronMainJsPathApi({
  argv: process.argv,
  fileURLToPath,
  importMetaUrl: import.meta.url,
  pickElectronMainScriptFromArgv
})
