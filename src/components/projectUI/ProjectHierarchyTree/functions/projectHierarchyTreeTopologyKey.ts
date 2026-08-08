import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

type T_topologySnapshot = {
  groups: Array<{
    id: string
    placementIds: string[]
  }>
  placements: Array<{
    groupId: string | null
    id: string
  }>
  tags: Array<{
    id: string
    wrapperId: string | null
  }>
  worlds: Array<{
    id: string
  }>
}

function compareTopologyIds (
  left: { id: string },
  right: { id: string }
): number {
  return left.id.localeCompare(right.id)
}

function buildTopologySnapshotFromTree (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[]
): T_topologySnapshot {
  const worlds = treeNodes
    .filter((node) => node.nodeKind === 'world')
    .map((node) => ({ id: node.id }))
    .sort(compareTopologyIds)

  const groups: T_topologySnapshot['groups'] = []
  const placements: T_topologySnapshot['placements'] = []
  const tags: T_topologySnapshot['tags'] = []

  for (const worldNode of treeNodes) {
    for (const child of worldNode.children) {
      if (child.nodeKind === 'group') {
        const placementIds = child.children
          .filter((row) => row.nodeKind === 'templatePlacement')
          .map((row) => ({ id: row.id }))
          .sort(compareTopologyIds)
          .map((row) => row.id)
        groups.push({
          id: child.id,
          placementIds
        })
        continue
      }
      if (child.nodeKind === 'templatePlacement') {
        placements.push({
          groupId: null,
          id: child.id
        })
        continue
      }
      if (child.nodeKind === 'tag') {
        tags.push({
          id: child.id,
          wrapperId: null
        })
        continue
      }
      if (child.nodeKind === 'tagWrapper') {
        for (const tagNode of child.children) {
          if (tagNode.nodeKind !== 'tag') {
            continue
          }
          tags.push({
            id: tagNode.id,
            wrapperId: child.id
          })
        }
      }
    }
  }

  groups.sort(compareTopologyIds)
  placements.sort((left, right) => left.id.localeCompare(right.id))
  tags.sort((left, right) => left.id.localeCompare(right.id))

  return {
    groups,
    placements,
    tags,
    worlds
  }
}

/**
 * Stable resync guard key from canonical world/group/placement/tag topology
 * (not labels or document rows).
 */
export function mapProjectHierarchyTreeToTopologyKey (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[]
): string {
  return JSON.stringify(buildTopologySnapshotFromTree(treeNodes))
}

/**
 * Resync guard for full skeleton replace: worlds/groups/placements only.
 * Tag membership syncs in place via patchTagBranchLabelsInPlace.
 */
export function mapProjectHierarchyTreeToStructuralTopologyKey (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[]
): string {
  const snapshot = buildTopologySnapshotFromTree(treeNodes)
  return JSON.stringify({
    groups: snapshot.groups,
    placements: snapshot.placements,
    worlds: snapshot.worlds
  })
}
