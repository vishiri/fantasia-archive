import { Result } from 'neverthrow'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { resolveFaProjectDocumentTemplateDisplayTitleFromFields } from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'
import { resolveFaProjectWorldDisplayName } from 'app/src/scripts/projectWorlds/faProjectWorldDisplayName_manager'
import { createResolveDialogComponentStore } from 'app/src/components/dialogs/DialogAboutFantasiaArchive/scripts/functions/createResolveDialogComponentStore'
import { resolveProjectHierarchyTreeNewDocumentDisplayName } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeAddNewDocumentLabel'
import {
  pickFaProjectDialogLastSelectedWorldId,
  readFaProjectLastSelectedWorldId,
  writeFaProjectLastSelectedWorldId
} from 'app/src/scripts/projectDialogUiPref/projectDialogUiPref_manager'
import { reportFaTemporaryDocumentCreateFailure } from 'app/src/scripts/openedDocuments/reportFaTemporaryDocumentCreateFailureWiring'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { S_FaOpenedDocuments } from 'src/stores/S_FaOpenedDocuments'

import {
  loadDialogQuickAddDocumentSources,
  resolveDialogQuickAddDocumentPreferredLanguageCode
} from './dialogQuickAddDocumentDataWiring'
import { runDialogQuickAddDocumentSession } from './dialogQuickAddDocumentSessionWiring'
import { createUseDialogQuickAddDocument } from './functions/createUseDialogQuickAddDocument'
import {
  isDialogQuickAddDocumentDirectInput,
  isDialogQuickAddDocumentStoreTarget
} from './functions/dialogQuickAddDocumentDialogInput'
import {
  FA_DIALOG_QUICK_ADD_DOCUMENT_TEMPLATE_FOCUS_MS,
  buildDialogQuickAddDocumentTemplateOptions,
  buildDialogQuickAddDocumentWorldOptions,
  findDialogQuickAddDocumentWorldById,
  pickFirstDialogQuickAddDocumentWorldId
} from './functions/dialogQuickAddDocumentOptions'

const resolveDialogComponentStoreOrNullBinding = createResolveDialogComponentStore({
  fromThrowable: Result.fromThrowable,
  getDialogComponentStore: () => S_DialogComponent()
}).resolveDialogComponentStore

export const useDialogQuickAddDocument = createUseDialogQuickAddDocument({
  buildTemplateOptions: buildDialogQuickAddDocumentTemplateOptions,
  buildWorldOptions: buildDialogQuickAddDocumentWorldOptions,
  computed,
  createTemporaryDocument: (input) => S_FaOpenedDocuments().createTemporaryDocument(input),
  findWorldById: findDialogQuickAddDocumentWorldById,
  isDialogQuickAddDocumentDirectInput,
  isDialogQuickAddDocumentStoreTarget,
  loadQuickAddDocumentSources: loadDialogQuickAddDocumentSources,
  nextTick,
  onBeforeUnmount,
  onMounted,
  pickFirstWorldId: pickFirstDialogQuickAddDocumentWorldId,
  pickWorldIdWithSavedPreference: pickFaProjectDialogLastSelectedWorldId,
  readLastSelectedWorldId: readFaProjectLastSelectedWorldId,
  ref,
  registerComponentDialogStackGuard,
  reportTemporaryDocumentCreateFailure: reportFaTemporaryDocumentCreateFailure,
  resolveDialogComponentStoreOrNull: resolveDialogComponentStoreOrNullBinding,
  resolveNewDocumentDisplayName: resolveProjectHierarchyTreeNewDocumentDisplayName,
  resolvePreferredLanguageCode: resolveDialogQuickAddDocumentPreferredLanguageCode,
  resolveTemplateOptionLabel: (template, languageCode) => {
    return resolveFaProjectDocumentTemplateDisplayTitleFromFields(
      template.titlePluralTranslations,
      template.titleSingularTranslations,
      languageCode
    )
  },
  resolveWorldOptionLabel: resolveFaProjectWorldDisplayName,
  runDialogQuickAddDocumentSession,
  sleep: async (ms) => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, ms)
    })
  },
  templateFocusMs: FA_DIALOG_QUICK_ADD_DOCUMENT_TEMPLATE_FOCUS_MS,
  watch,
  writeLastSelectedWorldId: writeFaProjectLastSelectedWorldId
})

export { FA_DIALOG_QUICK_ADD_DOCUMENT_TEMPLATE_FOCUS_MS }

export { buildDialogQuickAddDocumentWorldOptionIconStyle } from './dialogQuickAddDocumentWorldIconStyleWiring'
