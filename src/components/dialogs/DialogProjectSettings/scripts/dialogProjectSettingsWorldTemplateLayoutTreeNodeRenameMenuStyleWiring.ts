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

/** Extra width when template nickname menu shows pinned canonical aside. */
const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_RENAME_MENU_PINNED_ASIDE_EXTRA_WIDTH_PX = 212

/** Extra width when template nickname menu uses singular/plural columns. */
const DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_RENAME_MENU_SINGULAR_PLURAL_EXTRA_WIDTH_PX = 140

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring (deps: {
  getHasMenuPinnedAside: () => boolean
  getUsesSingularPluralRenameMenu: () => boolean
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
    let widthPx = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuWidthPx({
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
    if (deps.getHasMenuPinnedAside()) {
      widthPx += DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_RENAME_MENU_PINNED_ASIDE_EXTRA_WIDTH_PX
    }
    if (deps.getUsesSingularPluralRenameMenu()) {
      widthPx += DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_RENAME_MENU_SINGULAR_PLURAL_EXTRA_WIDTH_PX
    }
    renameMenuStyle.value = buildRenameMenuWidthStyle(widthPx)
  }

  return {
    renameMenuStyle,
    syncRenameMenuMaxWidth
  }
}
