import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'

import { createUseDialogDiscardOpenedDocumentTab } from './functions/createUseDialogDiscardOpenedDocumentTab'

export const useDialogDiscardOpenedDocumentTab = createUseDialogDiscardOpenedDocumentTab({
  S_FaOpenedDocuments,
  computed,
  ref,
  storeToRefs,
  watch
})
