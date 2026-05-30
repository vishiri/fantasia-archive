import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'

/** Injected deps for createFaActionDefinitionHandlersDialogs (level-1 factory). */
export interface I_createFaActionDefinitionHandlersDialogsDeps {
  S_FaActiveProject: () => {
    activeProject: { filePath: string; name: string } | null
    createProjectFromUserInput: (projectName: string) => Promise<'canceled' | 'created'>
    hasActiveProject: boolean
    openProjectFromKnownPath: (filePath: string) => Promise<'canceled' | 'opened' | 'reused'>
    openProjectFromUserDialog: () => Promise<'canceled' | 'opened' | 'reused'>
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
  openDialogComponent: (name: string) => void
  openDialogMarkdownDocument: (name: string) => void
  canOpenFloatingWindowWhileNoModal: () => boolean
  notifyFaProjectAlreadyActiveWarning: () => void
  notifyFaProjectCreatedPositive: () => void
  notifyFaProjectLoadedPositive: () => void
  tipsTricksTriviaNotification: (force: boolean) => void
}
