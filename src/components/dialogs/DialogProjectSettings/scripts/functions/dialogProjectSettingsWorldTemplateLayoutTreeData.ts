import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft,
  I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode,
  I_dialogProjectSettingsWorldTemplatePlacementDraft
} from 'app/types/I_dialogProjectSettingsWorlds'

export function resolveDialogProjectSettingsWorldTemplatePlacementUsesNickname (
  nickname: string
): boolean {
  return nickname.trim().length > 0
}

export function resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabel (params: {
  nickname: string
  templateDisplayName: string
}): string {
  const trimmedNickname = params.nickname.trim()
  if (trimmedNickname.length > 0) {
    return trimmedNickname
  }
  return params.templateDisplayName
}

type T_rootLayoutItem =
  | { kind: 'group', groupId: string, rootSortOrder: number }
  | { kind: 'placement', placementId: string, rootSortOrder: number }

/** Default Material icon for world template layout group rows in the he-tree. */
export const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON = 'mdi-database'

/** he-tree Draggable indent prop (px) per nested level. */
export const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_INDENT_PX = 31

/** Selector for he-tree row wrappers inside the world template layout tree. */
export const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_NODE_ITEM_SELECTOR = '.tree-node'

export function countDialogProjectSettingsWorldTemplateLayoutDraftNodes (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): number {
  return layout.groups.length + layout.placements.length
}

const WORLD_TEMPLATE_LAYOUT_PERSISTED_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isDialogProjectSettingsWorldTemplateLayoutPersistedId (
  value: string
): boolean {
  return WORLD_TEMPLATE_LAYOUT_PERSISTED_ID_PATTERN.test(value.trim())
}

function buildRootLayoutItems (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): T_rootLayoutItem[] {
  const items: T_rootLayoutItem[] = [
    ...layout.groups.map((group) => ({
      groupId: group.id,
      kind: 'group' as const,
      rootSortOrder: group.rootSortOrder
    })),
    ...layout.placements
      .filter((placement) => placement.groupId === null)
      .map((placement) => ({
        kind: 'placement' as const,
        placementId: placement.id,
        rootSortOrder: placement.rootSortOrder ?? 0
      }))
  ]
  items.sort((left, right) => left.rootSortOrder - right.rootSortOrder)
  return items
}

function buildGroupChildNodes (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  groupId: string
): I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[] {
  return layout.placements
    .filter((placement) => placement.groupId === groupId)
    .map((placement) => ({
      ...placement,
      groupSortOrder: placement.groupSortOrder ?? 0
    }))
    .sort((left, right) => left.groupSortOrder - right.groupSortOrder)
    .map((placement) => mapPlacementToHeTreeNode(placement))
}

function readPlacementDraftLabelFields (
  placement: I_dialogProjectSettingsWorldTemplatePlacementDraft
): {
    nickname: string
    templateDisplayName: string
  } {
  const nickname = placement.nickname ?? ''
  const templateDisplayName = placement.templateDisplayName ??
    (placement as { displayName?: string }).displayName ??
    ''
  return {
    nickname,
    templateDisplayName
  }
}

function mapPlacementToHeTreeNode (
  placement: I_dialogProjectSettingsWorldTemplatePlacementDraft
): I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode {
  const {
    nickname,
    templateDisplayName
  } = readPlacementDraftLabelFields(placement)
  const usesNickname = resolveDialogProjectSettingsWorldTemplatePlacementUsesNickname(nickname)
  const label = resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabel({
    nickname,
    templateDisplayName
  })
  return {
    children: [],
    documentCountInWorld: placement.documentCountInWorld,
    documentTemplateId: placement.documentTemplateId,
    icon: placement.icon,
    id: placement.id,
    label,
    nickname,
    nodeKind: 'template',
    templateDisplayName,
    usesNickname,
    worldAppendix: placement.worldAppendix
  }
}

/**
 * Builds nested he-tree data from a flat layout draft.
 */
export function buildHeTreeNodesFromWorldTemplateLayoutDraft (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[] {
  const groupById = new Map(layout.groups.map((group) => [group.id, group]))
  const placementById = new Map(layout.placements.map((placement) => [placement.id, placement]))
  const rootItems = buildRootLayoutItems(layout)

  return rootItems.map((item) => {
    if (item.kind === 'group') {
      const group = groupById.get(item.groupId)!
      return {
        children: buildGroupChildNodes(layout, group.id),
        documentCountInWorld: 0,
        documentTemplateId: null,
        icon: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON,
        id: group.id,
        label: group.displayName,
        nickname: '',
        nodeKind: 'group' as const,
        templateDisplayName: '',
        usesNickname: false,
        worldAppendix: ''
      }
    }
    return mapPlacementToHeTreeNode(placementById.get(item.placementId)!)
  })
}

type T_worldTemplateLayoutTreeStructureSnapshot = {
  groups: Array<{
    id: string
    rootSortOrder: number
  }>
  placements: Array<{
    documentTemplateId: string
    groupId: string | null
    groupSortOrder: number | null
    id: string
    rootSortOrder: number | null
  }>
}

function buildWorldTemplateLayoutTreeStructureSnapshot (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): T_worldTemplateLayoutTreeStructureSnapshot {
  return {
    groups: layout.groups.map((group) => ({
      id: group.id,
      rootSortOrder: group.rootSortOrder
    })),
    placements: layout.placements.map((placement) => ({
      documentTemplateId: placement.documentTemplateId,
      groupId: placement.groupId,
      groupSortOrder: placement.groupSortOrder,
      id: placement.id,
      rootSortOrder: placement.rootSortOrder
    }))
  }
}

/**
 * Stable Draggable key and resync guard: layout shape only, not display labels.
 */
export function mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): string {
  return JSON.stringify(buildWorldTemplateLayoutTreeStructureSnapshot(layout))
}

function applyPlacementDisplayFieldsToHeTreeNode (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode,
  placement: I_dialogProjectSettingsWorldTemplatePlacementDraft
): void {
  const {
    nickname,
    templateDisplayName
  } = readPlacementDraftLabelFields(placement)
  node.documentCountInWorld = placement.documentCountInWorld
  node.icon = placement.icon
  node.label = resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabel({
    nickname,
    templateDisplayName
  })
  node.nickname = nickname
  node.templateDisplayName = templateDisplayName
  node.usesNickname = resolveDialogProjectSettingsWorldTemplatePlacementUsesNickname(nickname)
  node.worldAppendix = placement.worldAppendix
}

/**
 * Updates he-tree node labels from a layout draft when structure is unchanged.
 */
export function patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes (
  treeNodes: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[],
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): void {
  const groupById = new Map(layout.groups.map((group) => [group.id, group]))
  const placementById = new Map(layout.placements.map((placement) => [placement.id, placement]))

  for (const node of treeNodes) {
    if (node.nodeKind === 'group') {
      const group = groupById.get(node.id)
      if (group === undefined) {
        continue
      }
      node.label = group.displayName
      for (const child of node.children) {
        const placement = placementById.get(child.id)
        if (placement === undefined) {
          continue
        }
        applyPlacementDisplayFieldsToHeTreeNode(child, placement)
      }
      continue
    }
    const placement = placementById.get(node.id)
    if (placement === undefined) {
      continue
    }
    applyPlacementDisplayFieldsToHeTreeNode(node, placement)
  }
}
