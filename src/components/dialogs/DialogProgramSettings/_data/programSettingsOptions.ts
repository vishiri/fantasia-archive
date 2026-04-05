import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import type { I_programSettingOption } from './programSettingsOptions.types'

export const PROGRAM_SETTINGS_OPTIONS: Record<keyof I_faUserSettings, I_programSettingOption> = {
  agressiveRelationshipFilter: {
    category: 'visualAccessibility',
    subcategory: 'visualsAppwideFunctionality'
  },
  allowQuickPopupSameKeyClose: {
    category: 'popupsFloatingWindows',
    subcategory: 'universalDialogSettings'
  },
  allowWiderScrollbars: {
    category: 'visualAccessibility',
    subcategory: 'accessibility'
  },
  compactDocumentCount: {
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
  disableCloseAftertSelectQuickSearch: {
    category: 'popupsFloatingWindows',
    subcategory: 'quickSearchDialog'
  },
  disableDocumentControlBar: {
    category: 'documentViewEdit',
    subcategory: 'documentControlBar'
  },
  disableDocumentControlBarGuides: {
    category: 'documentViewEdit',
    subcategory: 'documentControlBar'
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
  doNotcollaseTreeOptions: {
    category: 'hierarchicalTree',
    subcategory: 'treeBehavior'
  },
  doubleDashDocCount: {
    category: 'visualAccessibility',
    subcategory: 'accessibility'
  },
  hideAdvSearchCheatsheetButton: {
    category: 'visualAccessibility',
    subcategory: 'visualsAppwideFunctionality'
  },
  hideDeadCrossThrough: {
    category: 'visualAccessibility',
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
    subcategory: 'treeSettings'
  },
  hidePlushes: {
    category: 'visualAccessibility',
    subcategory: 'applicationExtras'
  },
  hideTooltipsProject: {
    category: 'visualAccessibility',
    subcategory: 'applicationExtras'
  },
  hideTooltipsStart: {
    category: 'visualAccessibility',
    subcategory: 'applicationExtras'
  },
  hideTreeExtraIcons: {
    category: 'hierarchicalTree',
    subcategory: 'iconSettings'
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
  hideTreeOrderNumbers: {
    category: 'hierarchicalTree',
    subcategory: 'informationDisplaySettings'
  },
  hideWelcomeScreenSocials: {
    category: 'visualAccessibility',
    subcategory: 'applicationExtras'
  },
  invertCategoryPosition: {
    category: 'hierarchicalTree',
    subcategory: 'informationDisplaySettings'
  },
  invertTreeSorting: {
    category: 'hierarchicalTree',
    subcategory: 'treeBehavior'
  },
  limitEditorHeight: {
    category: 'documentViewEdit',
    subcategory: 'documentBody'
  },
  noProjectName: {
    category: 'hierarchicalTree',
    subcategory: 'treeBehavior'
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
    category: 'openedDocumentsTabs',
    subcategory: 'tabBehavior'
  },
  preventPreviewsTree: {
    category: 'hierarchicalTree',
    subcategory: 'treeSettings'
  },
  showDocumentID: {
    category: 'developerSettings',
    subcategory: 'documentBody'
  },
  tagsAtTop: {
    category: 'hierarchicalTree',
    subcategory: 'tagSettings'
  },
  textShadow: {
    category: 'visualAccessibility',
    subcategory: 'accessibility'
  }
}
