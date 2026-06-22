import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft
} from 'app/types/I_dialogProjectSettingsWorlds'

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
