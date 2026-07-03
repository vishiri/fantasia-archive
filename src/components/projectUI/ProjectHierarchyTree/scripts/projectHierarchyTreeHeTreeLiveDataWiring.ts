import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

export function readProjectHierarchyTreeHeTreeLiveData (
  treeRef: I_faProjectHierarchyTreeHeTreeInstance | null
): I_faProjectHierarchyTreeHeTreeNode[] | null {
  const getData = treeRef?.getData
  if (typeof getData !== 'function') {
    return null
  }
  const data = getData.call(treeRef) as unknown
  if (!Array.isArray(data)) {
    return null
  }
  return data as I_faProjectHierarchyTreeHeTreeNode[]
}
