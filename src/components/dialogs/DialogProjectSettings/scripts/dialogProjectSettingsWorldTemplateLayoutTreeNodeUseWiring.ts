import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

import { useDialogProjectSettingsWorldTemplateLayoutTreeNodeImpl } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeUseImpl'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeUseDeps = {
  computed: typeof import('vue').computed
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  ref: typeof import('vue').ref
  toRef: typeof import('vue').toRef
}

export function createUseDialogProjectSettingsWorldTemplateLayoutTreeNode (
  deps: T_dialogProjectSettingsWorldTemplateLayoutTreeNodeUseDeps
): (
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
  ) => ReturnType<typeof useDialogProjectSettingsWorldTemplateLayoutTreeNodeImpl> {
  return function useDialogProjectSettingsWorldTemplateLayoutTreeNode (props, emit) {
    return useDialogProjectSettingsWorldTemplateLayoutTreeNodeImpl(deps, props, emit)
  }
}
