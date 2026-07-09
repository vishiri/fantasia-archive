import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch } from './faKeybindDocumentWorkspaceSaveDispatchWiring'
import { createFaKeybindRunCommand } from './functions/createFaKeybindRunCommand'

const faKeybindRunCommandApi = createFaKeybindRunCommand({
  runFaAction,
  tryResolveKeybindActionDispatch: tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch
})

export const faKeybindRunCommand = faKeybindRunCommandApi.faKeybindRunCommand
