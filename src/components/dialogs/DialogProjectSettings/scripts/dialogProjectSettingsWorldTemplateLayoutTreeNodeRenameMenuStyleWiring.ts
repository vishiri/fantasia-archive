import { ref } from 'vue'
import type { Ref } from 'vue'
import type { CSSProperties } from 'vue'

import {
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuWidthPx
} from './functions/dialogProjectSettingsWorldTemplateLayoutRenameMenuMaxWidth'

/** Mirrors $dialogProjectSettings-worldTemplateLayout-treeNode-remove-size in styles/_variables.scss. */
const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_NODE_ACTION_BUTTON_SIZE_PX = 24
/** Mirrors $dialogProjectSettings-worldTemplateLayout-treeNode-actions-gap. */
const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_NODE_ACTION_BUTTONS_GAP_PX = 4
/** Mirrors $dialogProjectSettings-worldTemplateLayout-renameMenu-actionsPadding. */
const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_RENAME_MENU_ACTIONS_PADDING_PX = 12
const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_RENAME_MENU_ACTION_BUTTONS_COUNT = 2
const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_RENAME_MENU_ACTIONS_SELECTOR =
  '.dialogProjectSettingsWorldTemplateLayoutTreeNode__actions'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring = {
  renameMenuStyle: Ref<CSSProperties | undefined>
  syncRenameMenuMaxWidth: () => void
}

function buildRenameMenuWidthStyle (widthPx: number): CSSProperties {
  const width = `${widthPx}px`
  return {
    maxWidth: width,
    minWidth: width,
    width
  }
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring (deps: {
  nodeAnchorRef: Ref<HTMLElement | null>
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring {
  const renameMenuStyle = ref<CSSProperties | undefined>(undefined)

  function syncRenameMenuMaxWidth (): void {
    const anchor = deps.nodeAnchorRef.value
    if (anchor === null) {
      renameMenuStyle.value = undefined
      return
    }
    const anchorRect = anchor.getBoundingClientRect()
    const actionsElement = anchor.querySelector(
      DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_RENAME_MENU_ACTIONS_SELECTOR
    )
    const actionsLeftPx = actionsElement instanceof HTMLElement
      ? actionsElement.getBoundingClientRect().left
      : null
    const widthPx = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuWidthPx({
      actionButtonSizePx: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_NODE_ACTION_BUTTON_SIZE_PX,
      actionButtonsCount: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_RENAME_MENU_ACTION_BUTTONS_COUNT,
      actionButtonsGapPx: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_NODE_ACTION_BUTTONS_GAP_PX,
      actionsPaddingPx: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_RENAME_MENU_ACTIONS_PADDING_PX,
      anchor: {
        anchorClientWidth: anchor.clientWidth,
        anchorLeftPx: anchorRect.left,
        actionsLeftPx
      }
    })
    renameMenuStyle.value = buildRenameMenuWidthStyle(widthPx)
  }

  return {
    renameMenuStyle,
    syncRenameMenuMaxWidth
  }
}
