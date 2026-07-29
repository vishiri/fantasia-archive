import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'
import * as appGlobalManagementUIModule from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/appInternals_manager'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'
import { noteboardHasContent } from 'app/src/scripts/floatingWindows/functions/shouldAutoOpenFilledNoteboard'

import { buildDocumentsMenu } from '../_data/documents'
import { buildHelpInfoMenu } from '../_data/helpInfo'
import { buildProjectMenu } from '../_data/project'
import { buildToolsMenu } from '../_data/tools'
import { createAppControlMenus } from './functions/createAppControlMenus'
import { readAppControlMenusTestingTypeFromCachedSnapshot } from './functions/appControlMenusTestingType'

const appControlMenusApi = createAppControlMenus({
  buildDocumentsMenu,
  buildHelpInfoMenu,
  buildProjectMenu,
  buildToolsMenu,
  computed,
  getFaActiveProjectStore: () => S_FaActiveProject(),
  getFaAppNoteboardStore: () => S_FaAppNoteboard(),
  getFaProjectNoteboardStore: () => S_FaProjectNoteboard(),
  getFaRecentProjectsStore: () => S_FaRecentProjects(),
  i18n,
  isFantasiaStorybookCanvas,
  noteboardHasContent,
  onMounted,
  openDialogMarkdownDocument: (documentName) => {
    appGlobalManagementUIModule.openDialogMarkdownDocument(documentName)
  },
  readAppControlMenusTestingTypeFromCachedSnapshot,
  ref,
  storeToRefs
})

export const appControlMenusEmbedDialogsDefault = appControlMenusApi.appControlMenusEmbedDialogsDefault

export const useAppControlMenus = appControlMenusApi.useAppControlMenus
