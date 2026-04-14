/**
 * Locale codes supported by the in-app language selector and persisted user settings.
 */
export type T_faUserSettingsLanguageCode = 'en-US' | 'fr' | 'de'

/**
 * Full persisted user preference surface mirrored with the main-process user settings store.
 */
export interface I_faUserSettings {
  aggressiveRelationshipFilter: boolean
  allowQuickPopupSameKeyClose: boolean
  allowWiderScrollbars: boolean
  compactDocumentCount: boolean
  compactTags: boolean
  darkMode: boolean
  disableCloseAfterSelectQuickSearch: boolean
  disableDocumentControlBar: boolean
  disableDocumentControlBarGuides: boolean
  disableDocumentCounts: boolean
  disableDocumentToolTips: boolean
  disableQuickSearchCategoryPrecheck: boolean
  disableSpellCheck: boolean
  doNotCollapseTreeOptions: boolean
  doubleDashDocCount: boolean
  hideAdvSearchCheatsheetButton: boolean
  hideDeadCrossThrough: boolean
  hideDocumentTitles: boolean
  hideEmptyFields: boolean
  hideHierarchyTree: boolean
  hidePlushes: boolean
  hideTooltipsProject: boolean
  hideTooltipsStart: boolean
  hideTreeExtraIcons: boolean
  hideTreeIconAddUnder: boolean
  hideTreeIconEdit: boolean
  hideTreeIconView: boolean
  hideTreeOrderNumbers: boolean
  hideWelcomeScreenSocials: boolean
  invertCategoryPosition: boolean
  invertTreeSorting: boolean
  languageCode: T_faUserSettingsLanguageCode
  limitEditorHeight: boolean
  noProjectName: boolean
  noTags: boolean
  preventAutoScroll: boolean
  preventFilledNoteBoardPopup: boolean
  preventPreviewsDocuments: boolean
  preventPreviewsPopups: boolean
  preventPreviewsTabs: boolean
  preventPreviewsTree: boolean
  showDocumentID: boolean
  tagsAtTop: boolean
  textShadow: boolean
}

/**
 * Preload bridge for reading and patching persisted user settings in the main process.
 */
export interface I_faUserSettingsAPI {

  /**
   * Get the user settings
   */
  getSettings: () => Promise<I_faUserSettings>

  /**
   * Set the user settings
   */
  setSettings: (patch: Partial<I_faUserSettings>) => Promise<void>

}
