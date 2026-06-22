import type {
  I_dialogProjectSettingsWorldTemplateGroupDraft,
  I_dialogProjectSettingsWorldTemplateLayoutDraft,
  I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode,
  I_dialogProjectSettingsWorldTemplatePlacementDraft
} from 'app/types/I_dialogProjectSettingsWorlds'

const WORLD_TEMPLATE_LAYOUT_PERSISTED_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isHeTreePersistedGroupId (value: string): boolean {
  return WORLD_TEMPLATE_LAYOUT_PERSISTED_ID_PATTERN.test(value.trim())
}

function resolveHeTreeGroupId (
  nodeId: string,
  priorGroup: I_dialogProjectSettingsWorldTemplateGroupDraft | undefined
): string {
  if (priorGroup !== undefined) {
    return priorGroup.id
  }
  if (isHeTreePersistedGroupId(nodeId)) {
    return nodeId
  }
  return crypto.randomUUID()
}

function resolveHeTreePlacementDocumentTemplateId (
  prior: I_dialogProjectSettingsWorldTemplatePlacementDraft | undefined,
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
): string {
  if (prior !== undefined) {
    return prior.documentTemplateId
  }
  if (node.documentTemplateId !== null) {
    return node.documentTemplateId
  }
  return ''
}

function resolvePriorPlacement (
  priorById: Map<string, I_dialogProjectSettingsWorldTemplatePlacementDraft>,
  priorByDocumentTemplateId: Map<string, I_dialogProjectSettingsWorldTemplatePlacementDraft>,
  nodeId: string,
  documentTemplateId: string
): I_dialogProjectSettingsWorldTemplatePlacementDraft | undefined {
  const priorByNodeId = priorById.get(nodeId)
  if (priorByNodeId !== undefined) {
    return priorByNodeId
  }
  if (documentTemplateId.length === 0) {
    return undefined
  }
  return priorByDocumentTemplateId.get(documentTemplateId)
}

/**
 * Resolves a he-tree node index within the top-level node list, with a fallback when absent.
 */
export function resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeIndex (
  nodes: readonly unknown[],
  node: unknown,
  fallbackIndex: number
): number {
  const rootIndex = nodes.indexOf(node)
  if (rootIndex >= 0) {
    return rootIndex
  }
  return fallbackIndex
}

type T_heTreeReverseMapState = {
  groups: I_dialogProjectSettingsWorldTemplateLayoutDraft['groups']
  placements: I_dialogProjectSettingsWorldTemplatePlacementDraft[]
  priorByDocumentTemplateId: Map<string, I_dialogProjectSettingsWorldTemplatePlacementDraft>
  priorById: Map<string, I_dialogProjectSettingsWorldTemplatePlacementDraft>
  priorGroupById: Map<string, I_dialogProjectSettingsWorldTemplateGroupDraft>
  seenDocumentTemplateIds: Set<string>
  seenGroupIds: Set<string>
  seenPlacementIds: Set<string>
}

function pushHeTreeTemplatePlacement (
  state: T_heTreeReverseMapState,
  placement: I_dialogProjectSettingsWorldTemplatePlacementDraft
): void {
  if (state.seenPlacementIds.has(placement.id)) {
    return
  }
  if (
    placement.documentTemplateId.length > 0 &&
    state.seenDocumentTemplateIds.has(placement.documentTemplateId)
  ) {
    return
  }
  state.seenPlacementIds.add(placement.id)
  if (placement.documentTemplateId.length > 0) {
    state.seenDocumentTemplateIds.add(placement.documentTemplateId)
  }
  state.placements.push(placement)
}

function appendHeTreeGroupNodesToReverseMap (
  nodes: readonly I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[],
  groupNodes: readonly I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[],
  state: T_heTreeReverseMapState
): void {
  groupNodes.forEach((node, groupNodeIndex) => {
    const priorGroup = state.priorGroupById.get(node.id)
    const groupId = resolveHeTreeGroupId(node.id, priorGroup)
    if (state.seenGroupIds.has(groupId)) {
      return
    }
    state.seenGroupIds.add(groupId)
    const rootIndex = resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeIndex(
      nodes,
      node,
      groupNodeIndex
    )
    state.groups.push({
      displayNameTranslations: priorGroup?.displayNameTranslations ?? node.displayNameTranslations,
      id: groupId,
      rootSortOrder: rootIndex
    })
    node.children.forEach((child, groupIndex) => {
      const documentTemplateId = resolveHeTreePlacementDocumentTemplateId(
        state.priorById.get(child.id),
        child
      )
      const prior = resolvePriorPlacement(
        state.priorById,
        state.priorByDocumentTemplateId,
        child.id,
        documentTemplateId
      )
      pushHeTreeTemplatePlacement(state, {
        documentCountInWorld: prior?.documentCountInWorld ?? child.documentCountInWorld,
        documentTemplateId,
        groupId,
        groupSortOrder: groupIndex,
        icon: prior?.icon ?? child.icon,
        id: prior?.id ?? child.id,
        nicknamePluralTranslations: prior?.nicknamePluralTranslations ?? child.nicknamePluralTranslations,
        nicknameSingularTranslations: {},
        rootSortOrder: null,
        templateDisplayName: prior?.templateDisplayName ?? child.templateDisplayName,
        worldAppendix: prior?.worldAppendix ?? child.worldAppendix
      })
    })
  })
}

function appendHeTreeRootTemplateNodesToReverseMap (
  nodes: readonly I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[],
  rootTemplateNodes: readonly I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[],
  state: T_heTreeReverseMapState
): void {
  rootTemplateNodes.forEach((node) => {
    const rootIndex = resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeIndex(
      nodes,
      node,
      0
    )
    const documentTemplateId = resolveHeTreePlacementDocumentTemplateId(
      state.priorById.get(node.id),
      node
    )
    const prior = resolvePriorPlacement(
      state.priorById,
      state.priorByDocumentTemplateId,
      node.id,
      documentTemplateId
    )
    pushHeTreeTemplatePlacement(state, {
      documentCountInWorld: prior?.documentCountInWorld ?? node.documentCountInWorld,
      documentTemplateId,
      groupId: null,
      groupSortOrder: null,
      icon: prior?.icon ?? node.icon,
      id: prior?.id ?? node.id,
      nicknamePluralTranslations: prior?.nicknamePluralTranslations ?? node.nicknamePluralTranslations,
      nicknameSingularTranslations: {},
      rootSortOrder: rootIndex,
      templateDisplayName: prior?.templateDisplayName ?? node.templateDisplayName,
      worldAppendix: prior?.worldAppendix ?? node.worldAppendix
    })
  })
}

function mapHeTreeNodeToGroupsAndPlacements (
  nodes: readonly I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[],
  priorLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const priorPlacements = priorLayout.placements
  const state: T_heTreeReverseMapState = {
    groups: [],
    placements: [],
    priorByDocumentTemplateId: new Map(
      priorPlacements.map((placement) => [placement.documentTemplateId, placement] as const)
    ),
    priorById: new Map(priorPlacements.map((placement) => [placement.id, placement])),
    priorGroupById: new Map(
      priorLayout.groups.map((group) => [group.id, group] as const)
    ),
    seenDocumentTemplateIds: new Set<string>(),
    seenGroupIds: new Set<string>(),
    seenPlacementIds: new Set<string>()
  }
  const groupNodes = nodes.filter((node) => node.nodeKind === 'group')
  const rootTemplateNodes = nodes.filter((node) => node.nodeKind === 'template')

  appendHeTreeGroupNodesToReverseMap(nodes, groupNodes, state)
  appendHeTreeRootTemplateNodesToReverseMap(nodes, rootTemplateNodes, state)

  return {
    groups: state.groups,
    placements: state.placements
  }
}

/**
 * Maps he-tree v-model output back into layout draft, preserving template metadata.
 */
export function mapHeTreeNodesToWorldTemplateLayoutDraft (
  nodes: readonly I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[],
  priorLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  return mapHeTreeNodeToGroupsAndPlacements(nodes, priorLayout)
}
