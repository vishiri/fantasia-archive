import { navigateToWorkspaceRouteForActiveProject } from 'app/src/scripts/appInternals/appInternals_manager'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'

import { notifyWelcomeScreenRecentProjectFileMissing } from './faWelcomeScreenRecentProjectNotify_manager'
import {
  hasWelcomeScreenAutoLoadMruHeadFailed,
  markWelcomeScreenAutoLoadMruHeadFailed
} from './functions/faWelcomeScreenAutoLoadSession'
import { createFaWelcomeScreenAutoLoadProject } from './functions/createFaWelcomeScreenAutoLoadProject'

const faWelcomeScreenAutoLoadProjectApi = createFaWelcomeScreenAutoLoadProject({
  getActiveProjectFilePath: () => S_FaActiveProject().activeProject?.filePath,
  getProjectManagementBridge: () => window.faContentBridgeAPIs?.projectManagement,
  hasWelcomeScreenAutoLoadMruHeadFailed,
  markWelcomeScreenAutoLoadMruHeadFailed,
  navigateToWorkspaceRouteForActiveProject,
  notifyWelcomeScreenRecentProjectFileMissing,
  refreshRecentProjects: () => S_FaRecentProjects().refreshRecentProjects(),
  runFaActionAwait
})

export const resolveWelcomeScreenAutoLoadTarget =
  faWelcomeScreenAutoLoadProjectApi.resolveWelcomeScreenAutoLoadTarget

export const openWelcomeScreenAutoLoadProject =
  faWelcomeScreenAutoLoadProjectApi.openWelcomeScreenAutoLoadProject
