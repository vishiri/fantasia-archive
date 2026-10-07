import type { I_faOpenedDocumentTreeOpenMeta } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Tree-node label and icon, or blanks when the document is not loaded in the tree.
 */
export function resolveHierarchyTreeDocumentOpenMetaFromNode (
  node: I_faProjectHierarchyTreeHeTreeNode | null
): I_faOpenedDocumentTreeOpenMeta {
  if (node === null) {
    const tabLabel = ''
    const templateIcon = ''
    return {
      tabLabel,
      templateIcon
    }
  }
  const tabLabel = node.label
  const templateIcon = node.icon
  return {
    tabLabel,
    templateIcon
  }
}

/**
 * Fills a blank tree-open label and icon from the document row.
 * A loaded hierarchy node keeps its own label and icon.
 */
export function resolveOpenedDocumentTreeOpenMetaForSeed (
  treeMeta: I_faOpenedDocumentTreeOpenMeta,
  displayName: string,
  fallbackTemplateIcon: string
): I_faOpenedDocumentTreeOpenMeta {
  const tabLabel = treeMeta.tabLabel.trim().length > 0
    ? treeMeta.tabLabel
    : displayName
  const templateIcon = treeMeta.templateIcon.trim().length > 0
    ? treeMeta.templateIcon
    : fallbackTemplateIcon
  return {
    tabLabel,
    templateIcon
  }
}
