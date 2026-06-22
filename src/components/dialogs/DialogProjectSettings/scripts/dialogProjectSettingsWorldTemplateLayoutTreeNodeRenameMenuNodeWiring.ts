import type { Ref } from 'vue'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring'
import {
  isDialogProjectSettingsWorldTemplateLayoutGroupNameTranslationsInvalid
} from './functions/dialogProjectSettingsWorldTemplateLayoutRenameMenuNodeHelpers'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring (deps: {
  emitRenameGroup: (groupId: string, displayNameTranslations: I_faLocaleStringTranslations) => void
  emitRenamePlacementNickname: (
    placementId: string,
    nicknameTranslations: I_faLocaleSingularPluralTranslations
  ) => void
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
    isGroupNameInvalid: isDialogProjectSettingsWorldTemplateLayoutGroupNameTranslationsInvalid,
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

  return renameMenuWiring
}
