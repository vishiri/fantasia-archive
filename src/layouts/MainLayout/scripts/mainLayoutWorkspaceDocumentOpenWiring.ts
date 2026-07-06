import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import type {
  I_faOpenedDocumentTreeOpenMeta,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Handles hierarchy tree document open requests for the workspace main layout.
 */
export function handleMainLayoutWorkspaceDocumentOpenRequest (
  documentId: string,
  mode: T_faOpenedDocumentOpenMode,
  treeMeta: I_faOpenedDocumentTreeOpenMeta
): void {
  void S_FaOpenedDocuments().openFromTree(documentId, mode, treeMeta)
}
