import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import { ref, type Ref } from 'vue'

export function createDialogProgramSettingsRefs (): {
  dialogModel: Ref<boolean>
  documentName: Ref<string>
  localSettings: Ref<I_faUserSettings | null>
  programSettingsTree: Ref<T_programSettingsRenderTree>
  searchSettingsQuery: Ref<string | null>
  selectedCategoryTab: Ref<string>
} {
  return {
    dialogModel: ref(false),
    documentName: ref(''),
    localSettings: ref<I_faUserSettings | null>(null),
    programSettingsTree: ref<T_programSettingsRenderTree>({}),
    searchSettingsQuery: ref<string | null>(''),
    selectedCategoryTab: ref<string>('')
  }
}
