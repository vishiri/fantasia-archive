import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'
import { findProjectHierarchyTreeDocumentNodeByDocumentId } from 'app/src/components/projectUI/ProjectHierarchyTree/scripts/projectHierarchyTreeDocumentNodeLookup'
import { resolveDocumentTabLabelFromOpenedTab } from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarVisibility'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'

import { createUseDialogDeleteOpenedDocument } from './functions/createUseDialogDeleteOpenedDocument'

export const useDialogDeleteOpenedDocument = createUseDialogDeleteOpenedDocument({
  S_FaOpenedDocuments,
  S_FaProjectHierarchyTree,
  findProjectHierarchyTreeDocumentNodeByDocumentId,
  computed,
  i18n,
  ref,
  resolveOpenedDocumentTabListLabel: resolveDocumentTabLabelFromOpenedTab,
  storeToRefs,
  watch
})
