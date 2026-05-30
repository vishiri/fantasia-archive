import type { I_faStagedImportSession } from 'app/types/I_faAppConfigElectronMain'

import {
  pathLooksLikeFaconfigFile as pathLooksLikeFaconfigFileFn,
  purgeExpiredStagedImportSessions
} from './functions/faAppConfigImportStagedState'

export const faAppConfigImportStagedSessions = new Map<string, I_faStagedImportSession>()

export function purgeFaAppConfigStagedImportSessionsExpired (): void {
  purgeExpiredStagedImportSessions(faAppConfigImportStagedSessions, Date.now())
}

export function pathLooksLikeFaconfigFile (filePath: string): boolean {
  return pathLooksLikeFaconfigFileFn(filePath)
}
