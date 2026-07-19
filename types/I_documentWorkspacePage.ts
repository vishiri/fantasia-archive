import type { I_faColorPickerPaletteAppendConfig } from 'app/types/I_faColorPickerInput'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

/** Injected deps for document workspace color picker wiring. */
export type T_createDocumentWorkspacePageColorPickersDeps = {
  computed: {
    <T>(fn: () => T): I_computedRef<T>
    <T>(options: {
      get: () => T
      set: (value: T) => void
    }): I_computedRef<T>
  }
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  parseFaProjectWorldColorPalleteToHexList: (colorPallete: string) => string[]
  patchWorldColorPalleteInLayout: (worldId: string, colorPallete: string) => void
  resolveOpenedDocumentTabIsInPreviewMode: (editState: boolean) => boolean
  routeDocumentId: I_computedRef<string>
  updateDocumentBackgroundColorDraft: (documentId: string, value: string) => void
  updateDocumentTextColorDraft: (documentId: string, value: string) => void
  worlds: I_computedRef<readonly I_faProjectHierarchyTreeWorkspaceWorld[]>
}

/** Injected deps for DocumentWorkspacePage composable factory. */
export type T_createUseDocumentWorkspacePageDeps = {
  S_FaOpenedDocuments: () => StoreGeneric & {
    findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
    updateDisplayNameDraft: (documentId: string, value: string) => void
    updateDocumentBackgroundColorDraft: (documentId: string, value: string) => void
    updateDocumentTextColorDraft: (documentId: string, value: string) => void
    updateIsCategoryDraft: (documentId: string, value: boolean) => void
    updateIsDeadDraft: (documentId: string, value: boolean) => void
    updateIsFinishedDraft: (documentId: string, value: boolean) => void
    updateIsMinorDraft: (documentId: string, value: boolean) => void
    updateParentDocumentIdDraft: (documentId: string, value: string) => void
  }
  S_FaProjectHierarchyTree: () => StoreGeneric & {
    patchWorldColorPalleteInLayout: (worldId: string, colorPallete: string) => void
  }
  computed: {
    <T>(getter: () => T): I_computedRef<T>
    <T>(options: {
      get: () => T
      set: (value: T) => void
    }): I_computedRef<T>
  }
  createDocumentWorkspacePageColorPickers: (
    input: T_createDocumentWorkspacePageColorPickersDeps
  ) => {
    backgroundColorFieldDescription: I_computedRef<string>
    backgroundColorFieldLabel: I_computedRef<string>
    backgroundColorModel: I_computedRef<string>
    documentColorPickersReadOnly: I_computedRef<boolean>
    onAppendToWorldPalette: (colorPallete: string) => void
    textColorFieldDescription: I_computedRef<string>
    textColorFieldLabel: I_computedRef<string>
    textColorModel: I_computedRef<string>
    worldColorPaletteAppend: I_computedRef<I_faColorPickerPaletteAppendConfig | undefined>
    worldPickerPalette: I_computedRef<readonly string[]>
  }
  createDocumentWorkspacePageIsCategoryToggle: (
    input: {
      computed: T_createUseDocumentWorkspacePageDeps['computed']
      documentTab: I_computedRef<I_faOpenedDocumentTab | null>
      i18n: T_createUseDocumentWorkspacePageDeps['i18n']
      resolveOpenedDocumentTabIsInPreviewMode: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentTabIsInPreviewMode']
      routeDocumentId: I_computedRef<string>
      updateIsCategoryDraft: (documentId: string, value: boolean) => void
    }
  ) => {
    isCategoryDescription: I_computedRef<string>
    isCategoryModel: I_computedRef<boolean>
    isCategoryTitle: I_computedRef<string>
    isCategoryToggleReadOnly: I_computedRef<boolean>
  }
  createDocumentWorkspacePageDocumentBooleanToggle: (
    input: {
      computed: T_createUseDocumentWorkspacePageDeps['computed']
      descriptionI18nKey: string
      documentTab: I_computedRef<I_faOpenedDocumentTab | null>
      draftField: 'isFinishedDraft' | 'isMinorDraft' | 'isDeadDraft'
      i18n: T_createUseDocumentWorkspacePageDeps['i18n']
      resolveOpenedDocumentTabIsInPreviewMode: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentTabIsInPreviewMode']
      routeDocumentId: I_computedRef<string>
      titleI18nKey: string
      updateDraft: (documentId: string, value: boolean) => void
    }
  ) => {
    description: I_computedRef<string>
    model: I_computedRef<boolean>
    readOnly: I_computedRef<boolean>
    title: I_computedRef<string>
  }
  createDocumentWorkspacePageRouteEffects: (input: {
    computed: {
      <T>(getter: () => T): I_computedRef<T>
    }
    findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
    hydrationComplete: { value: boolean }
    navigateToWorkspaceHomeRoute: () => Promise<void>
    onMounted: (hook: () => void) => void
    routeParams: {
      documentId?: string | string[]
    }
    watch: (
      source: () => string | boolean,
      effect: () => void,
      options?: { immediate?: boolean }
    ) => void
  }) => {
    routeDocumentId: I_computedRef<string>
  }
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  navigateToWorkspaceHomeRoute: () => Promise<void>
  onMounted: (hook: () => void) => void
  parseFaProjectWorldColorPalleteToHexList: (colorPallete: string) => string[]
  resolveOpenedDocumentDisplayNameFromTab: (
    tab: Pick<I_faOpenedDocumentTab, 'displayNameDraft' | 'tabLabel'>
  ) => string
  resolveOpenedDocumentTabIsInEditMode: (editState: boolean) => boolean
  resolveOpenedDocumentTabIsInPreviewMode: (editState: boolean) => boolean
  storeToRefs: T_piniaStoreToRefs
  useRoute: () => {
    params: {
      documentId?: string | string[]
    }
  }
  watch: (
    source: () => string | boolean,
    effect: () => void,
    options?: { immediate?: boolean }
  ) => void
}

/** DocumentWorkspacePage composable API. */
export type T_useDocumentWorkspacePageApi = () => {
  backgroundColorFieldDescription: I_computedRef<string>
  backgroundColorFieldLabel: I_computedRef<string>
  backgroundColorModel: I_computedRef<string>
  belongsUnderFieldDescription: I_computedRef<string>
  belongsUnderFieldLabel: I_computedRef<string>
  belongsUnderFieldReadOnly: I_computedRef<boolean>
  belongsUnderModel: I_computedRef<string>
  displayNameModel: I_computedRef<string>
  documentColorPickersReadOnly: I_computedRef<boolean>
  documentShowsEditFields: I_computedRef<boolean>
  documentShowsPreview: I_computedRef<boolean>
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  isCategoryDescription: I_computedRef<string>
  isCategoryModel: I_computedRef<boolean>
  isCategoryTitle: I_computedRef<string>
  isCategoryToggleReadOnly: I_computedRef<boolean>
  isDeadDescription: I_computedRef<string>
  isDeadModel: I_computedRef<boolean>
  isDeadTitle: I_computedRef<string>
  isDeadToggleReadOnly: I_computedRef<boolean>
  isFinishedDescription: I_computedRef<string>
  isFinishedModel: I_computedRef<boolean>
  isFinishedTitle: I_computedRef<string>
  isFinishedToggleReadOnly: I_computedRef<boolean>
  isMinorDescription: I_computedRef<string>
  isMinorModel: I_computedRef<boolean>
  isMinorTitle: I_computedRef<string>
  isMinorToggleReadOnly: I_computedRef<boolean>
  nameFieldLabel: I_computedRef<string>
  oneWayRelationshipTooltip: I_computedRef<string>
  onAppendToWorldPalette: (colorPallete: string) => void
  previewDisplayName: I_computedRef<string>
  textColorFieldDescription: I_computedRef<string>
  textColorFieldLabel: I_computedRef<string>
  textColorModel: I_computedRef<string>
  worldColorPaletteAppend: I_computedRef<I_faColorPickerPaletteAppendConfig | undefined>
  worldPickerPalette: I_computedRef<readonly string[]>
}
