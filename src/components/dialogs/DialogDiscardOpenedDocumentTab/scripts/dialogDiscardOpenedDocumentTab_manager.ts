import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'

import { createUseDialogDiscardOpenedDocumentTab } from './functions/createUseDialogDiscardOpenedDocumentTab'

export const useDialogDiscardOpenedDocumentTab = createUseDialogDiscardOpenedDocumentTab({
  S_FaOpenedDocuments,
  computed,
  i18n,
  ref,
  storeToRefs,
  watch
})
