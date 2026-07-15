export function resolveProjectHierarchyTreeNodeContextMenuLabels (
  t: (key: string) => string
): {
    addNewDocumentUnderThisLabel: string
    collapseAllUnderNodeLabel: string
    copyBackgroundColorLabel: string
    copyDocumentLabel: string
    copyNameLabel: string
    copyTextColorLabel: string
    deleteDocumentLabel: string
    editDocumentLabel: string
    expandAllUnderNodeLabel: string
    openDocumentLabel: string
  } {
  const expandAllUnderNodeLabel = t('projectUI.projectHierarchyTree.contextMenu.expandAllUnderNode')
  const collapseAllUnderNodeLabel = t('projectUI.projectHierarchyTree.contextMenu.collapseAllUnderNode')
  const copyNameLabel = t('projectUI.projectDocumentControlBar.copyName')
  const copyTextColorLabel = t('projectUI.projectDocumentControlBar.copyTextColor')
  const copyBackgroundColorLabel = t('projectUI.projectDocumentControlBar.copyBackgroundColor')
  const openDocumentLabel = t('projectUI.projectHierarchyTree.contextMenu.openDocument')
  const editDocumentLabel = t('projectUI.projectHierarchyTree.contextMenu.editDocument')
  const copyDocumentLabel = t('projectUI.projectHierarchyTree.contextMenu.copyDocument')
  const addNewDocumentUnderThisLabel = t('projectUI.projectHierarchyTree.contextMenu.addNewDocumentUnderThis')
  const deleteDocumentLabel = t('projectUI.projectHierarchyTree.contextMenu.deleteDocument')

  return {
    addNewDocumentUnderThisLabel,
    collapseAllUnderNodeLabel,
    copyBackgroundColorLabel,
    copyDocumentLabel,
    copyNameLabel,
    copyTextColorLabel,
    deleteDocumentLabel,
    editDocumentLabel,
    expandAllUnderNodeLabel,
    openDocumentLabel
  }
}
