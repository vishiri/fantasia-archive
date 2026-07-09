import { useI18n } from 'vue-i18n'

import type { I_projectDocumentControlBarTabContextMenuInput } from 'app/types/I_faProjectDocumentControlBarDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_ref } from 'app/types/I_vueCompositionShims'

import { buildProjectDocumentControlBarTabContextMenuSession } from './projectDocumentControlBarTabContextMenuSessionWiring'

export function createUseProjectDocumentControlBarTabContextMenu (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  createAppControlSingleMenuSubmenuHover: () => {
    onRootMenuHide: () => void
    onSubmenuActivatorEnter: (index: number) => void
    onSubmenuActivatorLeave: () => void
    onSubmenuContentEnter: () => void
    onSubmenuContentLeave: () => void
    onSubmenuModelUpdate: (index: number, shown: boolean) => void
    openSubmenuRowIndex: I_ref<number | null>
  }
  useI18n: typeof useI18n
}): (input: I_projectDocumentControlBarTabContextMenuInput) => ReturnType<typeof buildProjectDocumentControlBarTabContextMenuSession> {
  return function useProjectDocumentControlBarTabContextMenu (input) {
    return buildProjectDocumentControlBarTabContextMenuSession(deps, input)
  }
}
