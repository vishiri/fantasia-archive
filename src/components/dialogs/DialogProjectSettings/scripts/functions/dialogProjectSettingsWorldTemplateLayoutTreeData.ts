import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft
} from 'app/types/I_dialogProjectSettingsWorlds'

type T_worldTemplateLayoutTreeStructureSnapshot = {
  groups: Array<{
    id: string
  }>
  placements: Array<{
    documentTemplateId: string
    groupId: string | null
    id: string
  }>
}

/** Default Material icon for world template layout group rows in the he-tree. */
export const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_GROUP_ICON = 'mdi-database'

/** he-tree Draggable indent prop (px) per nested level. */
export const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_INDENT_PX = 31

/** Selector for he-tree row wrappers inside the world template layout tree. */
export const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_NODE_ITEM_SELECTOR = '.tree-node'

/** Root class on the he-tree Draggable scroll container. */
export const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_ROOT_CLASS =
  'dialogProjectSettingsWorldTemplateLayoutTree'

export function resolveDialogProjectSettingsWorldTemplateLayoutTreeScrollContainer (
  host: HTMLElement | null | undefined
): HTMLElement | null {
  if (host == null) {
    return null
  }
  if (host.classList.contains(DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_ROOT_CLASS)) {
    return host
  }
  const tree = host.querySelector(`.${DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_ROOT_CLASS}`)
  if (tree instanceof HTMLElement) {
    return tree
  }
  return host
}

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

function compareWorldTemplateLayoutTreeStructureIds (
  left: { id: string },
  right: { id: string }
): number {
  return left.id.localeCompare(right.id)
}

function buildWorldTemplateLayoutTreeStructureSnapshot (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): T_worldTemplateLayoutTreeStructureSnapshot {
  const groups = layout.groups
    .map((group) => ({
      id: group.id
    }))
    .sort(compareWorldTemplateLayoutTreeStructureIds)
  const placements = layout.placements
    .map((placement) => ({
      documentTemplateId: placement.documentTemplateId,
      groupId: placement.groupId,
      id: placement.id
    }))
    .sort(compareWorldTemplateLayoutTreeStructureIds)
  return {
    groups,
    placements
  }
}

/**
 * Stable Draggable key and resync guard: canonical topology (ids + group membership), not order or labels.
 */
export function mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): string {
  return JSON.stringify(buildWorldTemplateLayoutTreeStructureSnapshot(layout))
}
