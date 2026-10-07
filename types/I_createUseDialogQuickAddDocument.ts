import type { I_dialogComponentStoreLike } from 'app/types/I_dialogComponentStoreLike'
import type {
  I_dialogQuickAddDocumentTemplateOption,
  I_dialogQuickAddDocumentTemplateSource,
  I_dialogQuickAddDocumentWorldOption,
  I_dialogQuickAddDocumentWorldSource
} from 'app/types/I_dialogQuickAddDocument'
import type { T_faSelectInputModelValue } from 'app/types/I_faSelectInput'
import type { I_faTemporaryOpenedDocumentCreateInput } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

/** FaSelectInput expose used for template auto-open / world menu dismiss. */
export interface I_dialogQuickAddDocumentFaSelectInputLike {
  hidePopup?: () => void
  openPopup?: () => void
}

/** Mutable refs held for one Quick-Add Document dialog session. */
export interface I_dialogQuickAddDocumentSession {
  dialogModel: I_ref<boolean>
  documentName: I_ref<string>
  focusGeneration: I_ref<number>
  selectedTemplateId: I_ref<string | null>
  selectedWorldId: I_ref<string | null>
  showWorldSelect: I_computedRef<boolean>
  skipNextWorldChangeReopen: I_ref<boolean>
  templateOptions: I_computedRef<I_dialogQuickAddDocumentTemplateOption[]>
  templateSelectRef: I_ref<I_dialogQuickAddDocumentFaSelectInputLike | null>
  templatesById: I_ref<Map<string, I_dialogQuickAddDocumentTemplateSource>>
  worldOptions: I_computedRef<I_dialogQuickAddDocumentWorldOption[]>
  worldSelectRef: I_ref<I_dialogQuickAddDocumentFaSelectInputLike | null>
  worlds: I_ref<I_dialogQuickAddDocumentWorldSource[]>
}

/** Public API returned by runDialogQuickAddDocumentSession / useDialogQuickAddDocument. */
export interface I_dialogQuickAddDocumentApi {
  bindTemplateSelectRef: (el: unknown) => void
  bindWorldSelectRef: (el: unknown) => void
  dialogModel: I_ref<boolean>
  documentName: I_ref<string>
  onDialogHide: () => void
  onDialogShow: () => void
  onTemplateSelect: (value: T_faSelectInputModelValue | null | undefined) => Promise<void>
  onWorldFilterEnter: (event: Event) => void
  onWorldSelect: (value: T_faSelectInputModelValue | null | undefined) => void
  selectedTemplateId: I_ref<string | null>
  selectedTemplateOption: I_computedRef<I_dialogQuickAddDocumentTemplateOption | null>
  selectedWorldId: I_ref<string | null>
  selectedWorldOption: I_computedRef<I_dialogQuickAddDocumentWorldOption | null>
  showWorldSelect: I_computedRef<boolean>
  templateOptions: I_computedRef<I_dialogQuickAddDocumentTemplateOption[]>
  templateSelectRef: I_ref<I_dialogQuickAddDocumentFaSelectInputLike | null>
  worldOptions: I_computedRef<I_dialogQuickAddDocumentWorldOption[]>
}

/** Injected deps for createUseDialogQuickAddDocument (level-1 factory). */
export interface I_createUseDialogQuickAddDocumentDeps {
  buildTemplateOptions: (input: {
    preferredLanguageCode: T_faUserSettingsLanguageCode
    resolveTemplateLabel: (
      template: I_dialogQuickAddDocumentTemplateSource,
      languageCode: T_faUserSettingsLanguageCode
    ) => string
    templatesById: ReadonlyMap<string, I_dialogQuickAddDocumentTemplateSource>
    world: I_dialogQuickAddDocumentWorldSource | null | undefined
  }) => I_dialogQuickAddDocumentTemplateOption[]
  buildWorldOptions: (input: {
    preferredLanguageCode: T_faUserSettingsLanguageCode
    resolveWorldLabel: (
      displayNameTranslations: I_dialogQuickAddDocumentWorldSource['displayNameTranslations'],
      languageCode: T_faUserSettingsLanguageCode
    ) => string
    worlds: readonly I_dialogQuickAddDocumentWorldSource[]
  }) => I_dialogQuickAddDocumentWorldOption[]
  computed: <T>(getter: () => T) => I_computedRef<T>
  createTemporaryDocument: (input: I_faTemporaryOpenedDocumentCreateInput) => Promise<string>
  findWorldById: (
    worlds: readonly I_dialogQuickAddDocumentWorldSource[],
    worldId: string | null
  ) => I_dialogQuickAddDocumentWorldSource | null
  isDialogQuickAddDocumentDirectInput: (input: T_dialogName | undefined) => boolean
  isDialogQuickAddDocumentStoreTarget: (dialogToOpen: unknown) => boolean
  loadQuickAddDocumentSources: () => Promise<{
    templates: I_dialogQuickAddDocumentTemplateSource[]
    worlds: I_dialogQuickAddDocumentWorldSource[]
  }>
  nextTick: () => Promise<void>
  onBeforeUnmount: (hook: () => void) => void
  onMounted: (hook: () => void) => void
  pickFirstWorldId: (
    worlds: readonly { id: string }[]
  ) => string | null
  pickWorldIdWithSavedPreference: (input: {
    worlds: readonly { id: string }[]
    savedWorldId: string | null
    pickFirstWorldId: (
      worlds: readonly { id: string }[]
    ) => string | null
  }) => string | null
  readLastSelectedWorldId: () => Promise<string | null>
  ref: <T>(value: T) => I_ref<T>
  registerComponentDialogStackGuard: (dialogModel: I_ref<boolean>) => void
  reportTemporaryDocumentCreateFailure: (error: unknown) => void
  resolveDialogComponentStoreOrNull: () => I_dialogComponentStoreLike | null
  resolveNewDocumentDisplayName: (input: {
    preferredLanguageCode: T_faUserSettingsLanguageCode
    titlePluralTranslations: I_dialogQuickAddDocumentTemplateSource['titlePluralTranslations']
    titleSingularTranslations: I_dialogQuickAddDocumentTemplateSource['titleSingularTranslations']
  }) => string
  resolvePreferredLanguageCode: () => T_faUserSettingsLanguageCode
  resolveTemplateOptionLabel: (
    template: I_dialogQuickAddDocumentTemplateSource,
    languageCode: T_faUserSettingsLanguageCode
  ) => string
  resolveWorldOptionLabel: (
    displayNameTranslations: I_dialogQuickAddDocumentWorldSource['displayNameTranslations'],
    languageCode: T_faUserSettingsLanguageCode
  ) => string
  runDialogQuickAddDocumentSession: (
    deps: I_createUseDialogQuickAddDocumentDeps,
    props: { directInput?: T_dialogName | undefined }
  ) => I_dialogQuickAddDocumentApi
  sleep: (ms: number) => Promise<void>
  templateFocusMs: number
  watch: (
    source: I_ref<unknown> | (() => unknown),
    effect: (value?: unknown, oldValue?: unknown) => void | Promise<void>
  ) => void
  writeLastSelectedWorldId: (worldId: string) => Promise<void>
}
