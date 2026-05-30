import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import { createRunFaProjectFailsafePathReplyBoot } from './functions/createRunFaProjectFailsafePathReplyBoot'

export const runFaProjectFailsafePathReplyBoot = createRunFaProjectFailsafePathReplyBoot({
  getActiveProjectFilePath: () => S_FaActiveProject().activeProject?.filePath ?? null,
  getMode: () => process.env.MODE,
  installActiveProjectPathReply: (getPath) => {
    window.faContentBridgeAPIs?.faProjectFailsafe?.installActiveProjectPathReply(getPath)
  }
})
