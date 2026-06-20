import type { Ref } from 'vue'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring (deps: {
  emitRenameGroup: (groupId: string, displayName: string) => void
  emitRenamePlacementNickname: (placementId: string, nickname: string) => void
  getNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  nodeAnchorRef: Ref<HTMLElement | null>
}): ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring> {
  const renameMenuWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring({
    emitRenameGroup: deps.emitRenameGroup,
    emitRenamePlacementNickname: deps.emitRenamePlacementNickname,
    getNode: deps.getNode,
    isGroupNameInvalid: (displayName) => displayName.trim().length === 0,
    nodeAnchorRef: deps.nodeAnchorRef,
    translateGroupNameErrorRequired: () => {
      return deps.i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.groupNameErrorRequired')
    },
    translateGroupRenameInputLabel: () => {
      return deps.i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.groupRenameInputLabel')
    },
    translateTemplateCanonicalNameLabel: () => {
      return deps.i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.templateCanonicalNameLabel')
    },
    translateTemplateCanonicalNameTooltip: () => {
      return deps.i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.templateCanonicalNameTooltip')
    },
    translateTemplateNicknameLabel: () => {
      return deps.i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.templateNicknameLabel')
    },
    translateTemplateNicknameTooltip: () => {
      return deps.i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.templateNicknameTooltip')
    }
  })

  const renameMenuWiringBinding = renameMenuWiring

  return renameMenuWiringBinding
}
