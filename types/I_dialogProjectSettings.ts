import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsSaveValidationTooltipContent } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Props for DialogProjectSettings (Storybook direct open and optional snapshot override).
 */
export interface I_dialogProjectSettingsProps {
  directDocumentTemplatesSnapshot?: I_dialogProjectSettingsDocumentTemplateDraft[] | undefined
  directInput?: T_dialogName | undefined
  directSettingsSnapshot?: I_faProjectSettingsRoot | undefined
  directWorldsSnapshot?: I_dialogProjectSettingsWorldDraft[] | undefined
}

/** Injected dependencies for createDialogProjectSettingsUseHook. */
export type T_dialogProjectSettingsUseHookDeps = {
  buildDialogProjectSettingsSaveValidationTooltipForDraft: (
    projectName: string,
    worlds: I_dialogProjectSettingsWorldDraft[] | null,
    documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
  ) => I_dialogProjectSettingsSaveValidationTooltipContent
  computed: <T>(getter: () => T) => ComputedRef<T>
  createDialogProjectSettingsDialogActions: (
    params: {
      dialogModel: Ref<boolean>
      documentName: Ref<string>
      localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
      localSettings: Ref<I_faProjectSettingsRoot | null>
      localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
      props: I_dialogProjectSettingsProps
      selectedCategoryTab: Ref<string>
    }
  ) => {
    addDocumentTemplate: () => void
    addWorld: () => void
    openDialog: (input: T_dialogName) => void
    removeDocumentTemplate: (id: string) => void
    removeWorld: (id: string) => void
    saveAndCloseDialog: () => Promise<void>
    saveWithoutClosingDialog: () => Promise<void>
    updateDocumentTemplateTitleTranslations: (
      id: string,
      titleTranslations: I_faLocaleSingularPluralTranslations
    ) => void
    updateDocumentTemplateIcon: (id: string, icon: string) => void
    updateDocumentTemplateWorldAppendixTranslations: (
      id: string,
      worldAppendixTranslations: I_faProjectDocumentTemplateWorldAppendixTranslations
    ) => void
    updateWorldColor: (id: string, color: string) => void
    updateWorldColorPallete: (id: string, colorPallete: string) => void
    updateWorldDisplayNameTranslations: (
      id: string,
      displayNameTranslations: I_faProjectWorldDisplayNameTranslations
    ) => void
    updateWorldTemplateLayout: (
      id: string,
      templateLayout: I_dialogProjectSettingsWorldDraft['templateLayout']
    ) => void
  }
  createDialogProjectSettingsRefs: () => {
    dialogModel: Ref<boolean>
    documentName: Ref<string>
    localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
    localSettings: Ref<I_faProjectSettingsRoot | null>
    localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
    selectedCategoryTab: Ref<string>
  }
  hasDialogProjectSettingsDocumentTemplateNameValidationError: (
    templates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
  ) => boolean
  hasDialogProjectSettingsWorldColorPalleteValidationError: (
    worlds: I_dialogProjectSettingsWorldDraft[] | null
  ) => boolean
  hasDialogProjectSettingsWorldNameValidationError: (
    worlds: I_dialogProjectSettingsWorldDraft[] | null
  ) => boolean
  hasDialogProjectSettingsWorldTemplateLayoutValidationError: (
    worlds: I_dialogProjectSettingsWorldDraft[] | null,
    documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
  ) => boolean
  isDialogProjectSettingsFullDialogSaveDisabled: (
    projectName: string,
    worlds: I_dialogProjectSettingsWorldDraft[] | null,
    documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
  ) => boolean
  isDialogProjectSettingsProjectNameInvalid: (projectName: string) => boolean
  registerComponentDialogStackGuard: (dialogModel: Ref<boolean>) => void
  registerDialogProjectSettingsWatchers: (params: {
    openDialog: (input: T_dialogName) => void
    props: I_dialogProjectSettingsProps
  }) => void
  watch: (source: () => unknown, effect: () => void) => void
}
