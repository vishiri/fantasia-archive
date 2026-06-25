import type { DeepReadonly } from 'vue'

import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { T_dialogName, T_documentName } from 'app/types/T_appDialogsAndDocuments'

/** Injected deps for createFaActionDefinitionHandlersDialogs (level-1 factory). */
export interface I_createFaActionDefinitionHandlersDialogsDeps {
  S_FaActiveProject: () => {
    activeProject: DeepReadonly<I_faActiveProject> | null
    createProjectFromUserInput: (projectName: string) => Promise<'canceled' | 'created'>
    hasActiveProject: boolean
    openProjectFromKnownPath: (filePath: string) => Promise<'canceled' | 'opened' | 'reused' | 'superseded'>
    openProjectFromUserDialog: () => Promise<'canceled' | 'opened' | 'reused' | 'superseded'>
  }
  S_FaRecentProjects: () => {
    refreshRecentProjects: () => Promise<void>
  }
  S_FaKeybinds: () => {
    refreshKeybinds: () => Promise<void>
  }
  S_FaAppNoteboard: () => {
    refreshNoteboard: () => Promise<boolean>
  }
  S_FaProjectNoteboard: () => {
    refreshProjectNoteboard: () => Promise<boolean>
  }
  S_FaProjectStyling: () => {
    refreshProjectStyling: () => Promise<boolean>
  }
  S_FaAppStyling: () => {
    refreshAppStyling: () => Promise<boolean>
  }
  S_FaUserSettings: () => {
    refreshSettings: () => Promise<void>
  }
  FaActionUserCanceledError: new () => Error
  buildFaActionPayloadPreview: (value: unknown) => string
  runFaAction: <TId extends T_faActionId>(id: TId, payload: I_faActionPayloadMap[TId]) => void
  openDialogComponent: (name: T_dialogName) => void
  openDialogMarkdownDocument: (name: T_documentName) => void
  canOpenFloatingWindowWhileNoModal: () => boolean
  notifyFaProjectAlreadyActiveWarning: () => void
  notifyFaProjectCreatedPositive: () => void
  notifyFaProjectLoadedPositive: () => void
  tipsTricksTriviaNotification: (force: boolean) => void
  i18n: { global: { t: (key: string) => string } }
}
