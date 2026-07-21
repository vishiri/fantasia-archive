import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaProjectSidebar } from 'app/src/stores/S_FaProjectSidebar'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import {
  openDialogComponent,
  openDialogMarkdownDocument,
  tipsTricksTriviaNotification
} from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { canOpenFloatingWindowWhileNoModal } from 'app/src/scripts/appNoteboard/appNoteboard_manager'
import { maybeAutoOpenFilledNoteboard } from 'app/src/scripts/floatingWindows/functions/shouldAutoOpenFilledNoteboard'
import { i18n } from 'app/i18n/externalFileLoader'
import type { I_createFaActionDefinitionHandlersDialogsDeps } from 'app/types/I_createFaActionDefinitionHandlersDialogsDeps'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'

import { FaActionUserCanceledError } from './functions/faActionUserCanceledError'
import { buildFaActionPayloadPreview } from './faActionManagerErrorReporting_manager'
import * as faActionManagerRunForward from './faActionManagerRunForward_manager'
import {
  notifyFaProjectAlreadyActiveWarning,
  notifyFaProjectCreatedPositive,
  notifyFaProjectLoadedPositive
} from './faProjectSessionNotify_manager'

export const faActionDefinitionHandlersDialogsDeps = {
  S_FaActiveProject: () => S_FaActiveProject(),
  S_FaRecentProjects: () => S_FaRecentProjects(),
  S_FaKeybinds: () => S_FaKeybinds(),
  S_FaAppNoteboard: () => S_FaAppNoteboard(),
  S_FaProjectNoteboard: () => S_FaProjectNoteboard(),
  S_FaProjectSidebar: () => S_FaProjectSidebar(),
  S_FaProjectStyling: () => S_FaProjectStyling(),
  S_FaAppStyling: () => S_FaAppStyling(),
  S_FaUserSettings: () => S_FaUserSettings(),
  FaActionUserCanceledError,
  buildFaActionPayloadPreview,
  runFaAction: <TId extends T_faActionId>(id: TId, payload: I_faActionPayloadMap[TId]) => {
    faActionManagerRunForward.runFaActionThroughForward(id, payload)
  },
  openDialogComponent,
  openDialogMarkdownDocument,
  canOpenFloatingWindowWhileNoModal,
  maybeAutoOpenFilledNoteboard,
  notifyFaProjectAlreadyActiveWarning,
  notifyFaProjectCreatedPositive,
  notifyFaProjectLoadedPositive,
  tipsTricksTriviaNotification,
  i18n
} satisfies I_createFaActionDefinitionHandlersDialogsDeps
