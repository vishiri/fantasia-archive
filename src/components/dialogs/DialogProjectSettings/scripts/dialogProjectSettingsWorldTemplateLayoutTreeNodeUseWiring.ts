import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
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
  watch: typeof import('vue').watch
}

export function createUseDialogProjectSettingsWorldTemplateLayoutTreeNode (
  deps: T_dialogProjectSettingsWorldTemplateLayoutTreeNodeUseDeps
): (
    props: {
      blankGroupIds?: ReadonlySet<string>
      currentLanguageCode: T_faUserSettingsLanguageCode
      documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
      duplicateDocumentTemplateIds?: ReadonlySet<string>
      invalidDocumentTemplateIds?: ReadonlySet<string>
      node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
    },
    emit: {
      (event: 'deleteGroup', groupId: string): void
      (event: 'removePlacement', placementId: string): void
      (event: 'renamePlacementNickname', placementId: string, nicknameTranslations: I_faLocaleSingularPluralTranslations): void
      (event: 'renameGroup', groupId: string, displayNameTranslations: I_faLocaleStringTranslations): void
    }
  ) => ReturnType<typeof useDialogProjectSettingsWorldTemplateLayoutTreeNodeImpl> {
  return function useDialogProjectSettingsWorldTemplateLayoutTreeNode (props, emit) {
    return useDialogProjectSettingsWorldTemplateLayoutTreeNodeImpl(deps, props, emit)
  }
}
