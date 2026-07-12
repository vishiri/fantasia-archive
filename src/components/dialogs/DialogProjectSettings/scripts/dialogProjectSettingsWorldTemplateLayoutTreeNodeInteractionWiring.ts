import type { createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring'
import type { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

type T_actionTooltipsWiring = ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring>
type T_renameMenuWiring = ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring>

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring = {
  onEditClick: () => void
  onRemoveClick: () => void
  onRenameContextMenu: () => void
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring (deps: {
  actionTooltipsWiring: T_actionTooltipsWiring
  emitDeleteGroup: () => void
  emitRemovePlacement: () => void
  getNodeKind: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode['nodeKind']
  isRemoveDisabled: () => boolean
  renameMenuWiring: T_renameMenuWiring
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring {
  function onRemoveClick (): void {
    if (deps.isRemoveDisabled()) {
      return
    }
    deps.actionTooltipsWiring.dismissRemoveTooltip()
    if (deps.getNodeKind() === 'group') {
      deps.emitDeleteGroup()
      return
    }
    deps.emitRemovePlacement()
  }

  function onEditClick (): void {
    deps.actionTooltipsWiring.dismissEditTooltip()
    deps.renameMenuWiring.openRenameMenu()
  }

  function onRenameContextMenu (): void {
    if (!deps.renameMenuWiring.supportsRenameMenu.value) {
      return
    }
    deps.renameMenuWiring.openRenameMenu()
  }

  const onEditClickBinding = onEditClick
  const onRemoveClickBinding = onRemoveClick
  const onRenameContextMenuBinding = onRenameContextMenu

  return {
    onEditClick: onEditClickBinding,
    onRemoveClick: onRemoveClickBinding,
    onRenameContextMenu: onRenameContextMenuBinding
  }
}
