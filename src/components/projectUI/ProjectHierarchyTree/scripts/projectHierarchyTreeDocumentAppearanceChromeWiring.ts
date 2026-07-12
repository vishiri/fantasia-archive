import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveFaDocumentAppearanceChromeStyle } from 'app/src/scripts/documentAppearance/functions/faDocumentAppearanceChromeStyle'

export function resolveProjectHierarchyTreeDocumentAppearanceChrome (
  node: Pick<
    I_faProjectHierarchyTreeHeTreeNode,
    'documentBackgroundColor' | 'documentTextColor' | 'nodeKind'
  >
): I_faDocumentAppearanceChromeStyle | undefined {
  if (node.nodeKind !== 'document') {
    return undefined
  }
  return resolveFaDocumentAppearanceChromeStyle({
    documentBackgroundColor: node.documentBackgroundColor ?? '',
    documentTextColor: node.documentTextColor ?? ''
  })
}
