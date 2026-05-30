import { fileURLToPath } from 'node:url'

import { pickElectronMainScriptFromArgv } from './functions/resolveFaElectronMainJsPath'
import { createResolveFaElectronMainJsPathApi } from './functions/resolveFaElectronMainJsPathApi'

export const resolveFaElectronMainJsPath = createResolveFaElectronMainJsPathApi({
  argv: process.argv,
  fileURLToPath,
  importMetaUrl: import.meta.url,
  pickElectronMainScriptFromArgv
})
