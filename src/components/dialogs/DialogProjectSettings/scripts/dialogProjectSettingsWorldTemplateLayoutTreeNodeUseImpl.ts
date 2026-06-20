import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring'
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
    ref: typeof import('vue').ref
    toRef: typeof import('vue').toRef
  },
  props: {
    blankGroupIds?: ReadonlySet<string>
    duplicateDocumentTemplateIds?: ReadonlySet<string>
    invalidDocumentTemplateIds?: ReadonlySet<string>
    node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  },
  emit: {
    (event: 'deleteGroup', groupId: string): void
    (event: 'removePlacement', placementId: string): void
    (event: 'renamePlacementNickname', placementId: string, nickname: string): void
    (event: 'renameGroup', groupId: string, displayName: string): void
  }
): ReturnType<typeof bindDialogProjectSettingsWorldTemplateLayoutTreeNodeUseApi> {
  const nodeAnchorRef = deps.ref<HTMLElement | null>(null)
  const nodeRef = deps.toRef(props, 'node')
  const actionTooltipsWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring()
  const presentationWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring({
    computed: deps.computed,
    i18n: deps.i18n,
    props
  })

  const renameMenuWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring({
    emitRenameGroup: (groupId, displayName) => {
      emit('renameGroup', groupId, displayName)
    },
    emitRenamePlacementNickname: (placementId, nickname) => {
      emit('renamePlacementNickname', placementId, nickname)
    },
    getNode: () => nodeRef.value,
    i18n: deps.i18n,
    nodeAnchorRef
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
