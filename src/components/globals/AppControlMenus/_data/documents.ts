import { i18n } from 'app/i18n/externalFileLoader'

import type { I_appMenuBuildSession, I_appMenuList } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

export function buildDocumentsMenu (session: I_appMenuBuildSession): I_appMenuList {
  const gate = session.hasActiveProject
  const openQuickAddDocumentDialog = (): void => {
    runFaAction('openQuickAddDocumentDialog', undefined)
  }
  const openQuickSearchDocumentDialog = (): void => {
    runFaAction('openQuickSearchDocumentDialog', undefined)
  }
  const openProjectMediaDialog = (): void => {
    runFaAction('openProjectMediaDialog', undefined)
  }
  const data = [
    faMenuItem('appControlMenus.documents.items.quickAddNewDocument', 'mdi-text-box-plus-outline', {
      conditions: gate,
      keybindCommandId: 'quickNewDocument',
      trigger: openQuickAddDocumentDialog
    }),
    faMenuItem('appControlMenus.documents.items.quickSearchDocument', 'mdi-database-search', {
      conditions: gate,
      keybindCommandId: 'quickExistingDocument',
      trigger: openQuickSearchDocumentDialog
    }),
    faMenuItem('appControlMenus.documents.items.projectMedia', 'fa-solid fa-photo-film', {
      conditions: gate,
      keybindCommandId: 'openProjectMedia',
      trigger: openProjectMediaDialog
    }),
    faMenuSeparator('documents-sep-after-search'),
    faMenuItem('appControlMenus.documents.items.massDeleteDocument', 'mdi-text-box-remove-outline', {
      conditions: false,
      specialColor: 'secondary'
    }),
    faMenuSeparator('documents-sep-before-export'),
    faMenuItem('appControlMenus.documents.items.exportProjectDocuments', 'mdi-database-export-outline', {
      conditions: false
    })
  ]
  const title = i18n.global.t('appControlMenus.documents.title')

  return {
    data,
    title
  }
}
