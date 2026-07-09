import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'
import { resolveDocumentTabLabelFromOpenedTab } from 'app/src/components/projectUI/ProjectDocumentControlBar/functions/projectDocumentControlBarVisibility'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'

import { createUseDialogDeleteOpenedDocument } from './functions/createUseDialogDeleteOpenedDocument'

export const useDialogDeleteOpenedDocument = createUseDialogDeleteOpenedDocument({
  S_FaOpenedDocuments,
  computed,
  i18n,
  ref,
  resolveOpenedDocumentTabListLabel: resolveDocumentTabLabelFromOpenedTab,
  storeToRefs,
  watch
})
