import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring'
import { isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled } from './functions/dialogProjectSettingsWorldTemplateLayoutTreeNodePresentation'
import { wireDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameTooltipRenameMenu } from './dialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameTooltipRenameMenuWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring'
import { bindDialogProjectSettingsWorldTemplateLayoutTreeNodeUseApi } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeUseApiWiring'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

export function useDialogProjectSettingsWorldTemplateLayoutTreeNodeImpl (
  deps: {
    computed: typeof import('vue').computed
    i18n: {
      global: {
        t: (key: string) => string
      }
    }
    onBeforeUnmount: typeof import('vue').onBeforeUnmount
    ref: typeof import('vue').ref
    toRef: typeof import('vue').toRef
    watch: typeof import('vue').watch
  },
  props: {
    blankGroupIds?: ReadonlySet<string> | undefined
    currentLanguageCode: T_faUserSettingsLanguageCode
    documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
    duplicateDocumentTemplateIds?: ReadonlySet<string> | undefined
    invalidDocumentTemplateIds?: ReadonlySet<string> | undefined
    node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  },
  emit: {
    (event: 'deleteGroup', groupId: string): void
    (event: 'removePlacement', placementId: string): void
    (event: 'renamePlacementNickname', placementId: string, nicknameTranslations: I_faLocaleSingularPluralTranslations): void
    (event: 'renameGroup', groupId: string, displayNameTranslations: I_faLocaleStringTranslations): void
  }
): ReturnType<typeof bindDialogProjectSettingsWorldTemplateLayoutTreeNodeUseApi> {
  const nodeAnchorRef = deps.ref<HTMLElement | null>(null)
  const nodeRef = deps.toRef(props, 'node')
  let getRenameMenuOpen = (): boolean => false
  const actionTooltipsWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring({
    getRenameMenuOpen: () => getRenameMenuOpen(),
    onBeforeUnmount: deps.onBeforeUnmount
  })
  const presentationWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring({
    computed: deps.computed,
    i18n: deps.i18n,
    props
  })

  const renameMenuWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring({
    emitRenameGroup: (groupId, displayNameTranslations) => {
      emit('renameGroup', groupId, displayNameTranslations)
    },
    emitRenamePlacementNickname: (placementId, nicknameTranslations) => {
      emit('renamePlacementNickname', placementId, nicknameTranslations)
    },
    getNode: () => nodeRef.value,
    i18n: deps.i18n,
    nodeAnchorRef
  })

  getRenameMenuOpen = (): boolean => renameMenuWiring.renameMenuOpen.value

  wireDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameTooltipRenameMenu({
    actionTooltipsWiring,
    renameMenuOpen: renameMenuWiring.renameMenuOpen,
    watch: deps.watch
  })

  const interactionWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring({
    actionTooltipsWiring,
    emitDeleteGroup: () => {
      emit('deleteGroup', props.node.id)
    },
    emitRemovePlacement: () => {
      emit('removePlacement', props.node.id)
    },
    getNodeKind: () => props.node.nodeKind,
    isRemoveDisabled: () => isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled(props.node),
    renameMenuWiring
  })

  return bindDialogProjectSettingsWorldTemplateLayoutTreeNodeUseApi({
    actionTooltipsWiring,
    interactionWiring,
    nodeAnchorRef,
    presentationWiring,
    renameMenuWiring
  })
}
