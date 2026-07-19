import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveFaDocumentAppearanceChromeStyle } from 'app/src/scripts/documentAppearance/functions/faDocumentAppearanceChromeStyle'
import { resolveFaDocumentStatusLabelColor } from 'app/src/scripts/documentAppearance/functions/resolveFaDocumentStatusLabelColor'

export function resolveProjectHierarchyTreeDocumentAppearanceChrome (
  node: Pick<
    I_faProjectHierarchyTreeHeTreeNode,
    'documentBackgroundColor' | 'documentTextColor' | 'isMinor' | 'nodeKind'
  >
): I_faDocumentAppearanceChromeStyle | undefined {
  if (node.nodeKind !== 'document') {
    return undefined
  }
  const baseChrome = resolveFaDocumentAppearanceChromeStyle({
    documentBackgroundColor: node.documentBackgroundColor ?? '',
    documentTextColor: node.documentTextColor ?? ''
  })
  const statusLabelColor = resolveFaDocumentStatusLabelColor({
    documentTextColor: node.documentTextColor ?? '',
    isMinor: node.isMinor === true
  })
  if (baseChrome === undefined && statusLabelColor === undefined) {
    return undefined
  }
  return {
    ...baseChrome,
    color: baseChrome?.color ?? statusLabelColor
  }
}
