import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { createFaKeybindRunCommand } from './functions/createFaKeybindRunCommand'

const faKeybindRunCommandApi = createFaKeybindRunCommand({
  runFaAction
})

export const faKeybindRunCommand = faKeybindRunCommandApi.faKeybindRunCommand
