import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_appSettingsStaticOption } from 'app/types/I_dialogAppSettings'

export const APP_SETTINGS_OPTIONS: Record<
Exclude<keyof I_faUserSettings, 'languageCode'>,
I_appSettingsStaticOption
> = {
  aggressiveRelationshipFilter: {
    category: 'visualAccessibility',
    subcategory: 'visualsAppwideFunctionality'
  },
  allowQuickPopupSameKeyClose: {
    category: 'popupsFloatingWindows',
    subcategory: 'universalDialogSettings'
  },
  allowWiderScrollbars: {
    category: 'accessibility',
    subcategory: 'accessibility'
  },
  disableCategoryCount: {
    category: 'hierarchicalTree',
    subcategory: 'informationDisplaySettings'
  },
  compactTags: {
    category: 'hierarchicalTree',
    subcategory: 'tagSettings'
  },
  darkMode: {
    category: 'visualAccessibility',
    subcategory: 'visualsAppwideFunctionality'
  },
  disableCloseAfterSelectQuickSearch: {
    category: 'popupsFloatingWindows',
    subcategory: 'quickSearchDialog'
  },
  disableAppControlBar: {
    category: 'visualAccessibility',
    subcategory: 'appControlBar'
  },
  disableAppControlBarContentButtons: {
    category: 'visualAccessibility',
    subcategory: 'appControlBar'
  },
  disableAppControlBarFunctionButtons: {
    category: 'visualAccessibility',
    subcategory: 'appControlBar'
  },
  disableAppControlBarGuides: {
    category: 'visualAccessibility',
    subcategory: 'appControlBar'
  },
  disableDocumentCounts: {
    category: 'hierarchicalTree',
    subcategory: 'informationDisplaySettings'
  },
  disableDocumentToolTips: {
    category: 'documentViewEdit',
    subcategory: 'documentBody'
  },
  disableQuickSearchCategoryPrecheck: {
    category: 'popupsFloatingWindows',
    subcategory: 'quickSearchDialog'
  },
  disableSpellCheck: {
    category: 'visualAccessibility',
    subcategory: 'visualsAppwideFunctionality'
  },
  doNotCollapseTreeOptions: {
    category: 'hierarchicalTree',
    subcategory: 'treeBehavior'
  },
  doubleDashDocCount: {
    category: 'accessibility',
    subcategory: 'accessibility'
  },
  hideAdvSearchCheatsheetButton: {
    category: 'visualAccessibility',
    subcategory: 'visualsAppwideFunctionality'
  },
  hideDeadCrossThrough: {
    category: 'accessibility',
    subcategory: 'accessibility'
  },
  hideDocumentTitles: {
    category: 'documentViewEdit',
    subcategory: 'documentBody'
  },
  hideEmptyFields: {
    category: 'documentViewEdit',
    subcategory: 'documentBody'
  },
  hideHierarchyTree: {
    category: 'hierarchicalTree',
    subcategory: 'treeBehavior'
  },
  hidePlushes: {
    category: 'visualAccessibility',
    subcategory: 'applicationExtras'
  },
  hideTooltipsProject: {
    category: 'projectOverview',
    subcategory: 'projectOverviewBehavior'
  },
  hideTooltipsStart: {
    category: 'welcomeScreen',
    subcategory: 'welcomeScreenBehavior'
  },
  hideTreeIconAddUnder: {
    category: 'hierarchicalTree',
    subcategory: 'iconSettings'
  },
  hideTreeIconEdit: {
    category: 'hierarchicalTree',
    subcategory: 'iconSettings'
  },
  hideTreeIconView: {
    category: 'hierarchicalTree',
    subcategory: 'iconSettings'
  },
  hideTreeLines: {
    category: 'hierarchicalTree',
    subcategory: 'treeBehavior'
  },
  hideTreeOrderNumbers: {
    category: 'hierarchicalTree',
    subcategory: 'informationDisplaySettings'
  },
  hideRecentProjectTooltip: {
    category: 'welcomeScreen',
    subcategory: 'welcomeScreenBehavior'
  },
  hideWelcomeScreenSocials: {
    category: 'welcomeScreen',
    subcategory: 'welcomeScreenBehavior'
  },
  invertCategoryPosition: {
    category: 'hierarchicalTree',
    subcategory: 'informationDisplaySettings'
  },
  limitEditorHeight: {
    category: 'documentViewEdit',
    subcategory: 'documentBody'
  },
  logFullActivityPayload: {
    category: 'developerSettings',
    subcategory: 'documentBody'
  },
  noProjectName: {
    category: 'hierarchicalTree',
    subcategory: 'informationDisplaySettings'
  },
  noTags: {
    category: 'hierarchicalTree',
    subcategory: 'tagSettings'
  },
  preventAutoScroll: {
    category: 'documentViewEdit',
    subcategory: 'documentBody'
  },
  preventFilledNoteBoardPopup: {
    category: 'popupsFloatingWindows',
    subcategory: 'floatingWindows'
  },
  preventPreviewsDocuments: {
    category: 'documentViewEdit',
    subcategory: 'documentBody'
  },
  preventPreviewsPopups: {
    category: 'popupsFloatingWindows',
    subcategory: 'quickSearchDialog'
  },
  preventPreviewsTabs: {
    category: 'visualAccessibility',
    subcategory: 'tabBehavior'
  },
  preventPreviewsTree: {
    category: 'hierarchicalTree',
    subcategory: 'treeBehavior'
  },
  showDocumentID: {
    category: 'developerSettings',
    subcategory: 'documentBody'
  },
  skipWelcomeScreen: {
    category: 'welcomeScreen',
    subcategory: 'welcomeScreenBehavior'
  },
  tagsAtTop: {
    category: 'hierarchicalTree',
    subcategory: 'tagSettings'
  },
  textShadow: {
    category: 'accessibility',
    subcategory: 'accessibility'
  }
}
