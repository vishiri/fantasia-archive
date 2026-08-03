import type { T_faUserSettingsAppTheme } from 'app/types/faUserSettingsAppThemeRegistry'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeSearchHit,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'

/**
 * Hierarchy tree session seed for ProjectHierarchyTree Component Playwright.
 */
export interface I_faComponentTestingHierarchyTreeSeed {
  /**
   * When set, replaces S_FaProjectHierarchyTree.treeData (document rows / expanded children).
   * Prefer matching topology to worlds so session resync keeps nested documents.
   */
  treeData?: I_faProjectHierarchyTreeHeTreeNode[] | undefined

  /**
   * When set, replaces hierarchy UI expand/scroll state via applyUiState.
   */
  uiState?: I_faProjectHierarchyTreeUiState | undefined

  /**
   * Workspace layout worlds; drives skeleton resync and default expand.
   */
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
}

/**
 * Frozen contextBridge cannot replace projectContent getters in Electron Component Playwright.
 * Seed maps here so open/temp document paths resolve without IPC.
 */
export interface I_faComponentTestingProjectContentOverrides {
  documentsById?: Record<string, I_faProjectDocument> | undefined
  /**
   * Placement children lists keyed by 'placementId::__root__' or 'placementId::<parentDocumentId>'.
   * Used when frozen contextBridge blocks listPlacementDocumentChildren / reindex stubs.
   */
  placementDocumentChildrenByKey?: Record<string, I_faProjectHierarchyTreeDocumentChild[]> | undefined
  /**
   * Hierarchy search hits by trimmed query. Key '*' matches any query not listed.
   * Used when frozen contextBridge blocks searchProjectHierarchy stubs.
   */
  searchHitsByQuery?: Record<string, I_faProjectHierarchyTreeSearchHit[]> | undefined
  templatesById?: Record<string, I_faProjectDocumentTemplate> | undefined
  worldsById?: Record<string, I_faProjectWorld> | undefined
}

/**
 * Payload for the component-testing Playwright store seed probe (TEST_ENV components only).
 */
export interface I_faComponentTestingStoreSeed {
  /**
   * When set to null, clears S_FaActiveProject. When omitted, leaves the active project unchanged.
   */
  activeProject?: {
    filePath: string
    id: string
    name: string
  } | null | undefined

  /**
   * When defined, patches appTheme on S_FaUserSettings and applies body theme classes.
   */
  appTheme?: T_faUserSettingsAppTheme | undefined

  /**
   * When defined, sets S_FaAppNoteboard text via applyRoot (content-dot / filled-noteboard tests).
   */
  appNoteboardText?: string | undefined

  /**
   * When defined, patches hidePlushes on S_FaUserSettings (merged with the current settings object).
   */
  hidePlushes?: boolean | undefined

  /**
   * When defined, patches hideTabCloseButton on S_FaUserSettings (merged with the current settings object).
   */
  hideTabCloseButton?: boolean | undefined

  /**
   * When defined, patches hideTreeIconAddUnder on S_FaUserSettings.
   */
  hideTreeIconAddUnder?: boolean | undefined

  /**
   * When defined, patches hideTreeIconEdit on S_FaUserSettings.
   */
  hideTreeIconEdit?: boolean | undefined

  /**
   * When defined, patches hideTreeIconView on S_FaUserSettings.
   */
  hideTreeIconView?: boolean | undefined

  /**
   * When defined, patches hideTreeOrderNumbers on S_FaUserSettings.
   */
  hideTreeOrderNumbers?: boolean | undefined

  /**
   * When defined, patches hideTreeLines on S_FaUserSettings.
   */
  hideTreeLines?: boolean | undefined

  /**
   * When defined, patches noProjectName on S_FaUserSettings.
   */
  noProjectName?: boolean | undefined

  /**
   * When defined, patches hideHierarchyTree on S_FaUserSettings (MainLayout drawer).
   */
  hideHierarchyTree?: boolean | undefined

  /**
   * When defined, patches forceSublevelCollapseInTree on S_FaUserSettings.
   */
  forceSublevelCollapseInTree?: boolean | undefined

  /**
   * When defined, patches disableDocumentCounts on S_FaUserSettings.
   */
  disableDocumentCounts?: boolean | undefined

  /**
   * When defined, patches disableCategoryCount on S_FaUserSettings.
   */
  disableCategoryCount?: boolean | undefined

  /**
   * When defined, patches invertCategoryPosition on S_FaUserSettings.
   */
  invertCategoryPosition?: boolean | undefined

  /**
   * When defined, patches doubleDashDocCount on S_FaUserSettings.
   */
  doubleDashDocCount?: boolean | undefined

  /**
   * When defined, patches hideDeadCrossThrough on S_FaUserSettings.
   */
  hideDeadCrossThrough?: boolean | undefined

  /**
   * When defined, patches hideTooltipsProject on S_FaUserSettings (merged with the current settings object).
   */
  hideTooltipsProject?: boolean | undefined

  /**
   * When defined, patches disableAppControlBar on S_FaUserSettings (merged with the current settings object).
   */
  disableAppControlBar?: boolean | undefined

  /**
   * When defined, patches disableAppControlBarGuides on S_FaUserSettings (merged with the current settings object).
   */
  disableAppControlBarGuides?: boolean | undefined

  /**
   * When defined, patches disableAppControlBarFunctionButtons on S_FaUserSettings.
   */
  disableAppControlBarFunctionButtons?: boolean | undefined

  /**
   * When defined, patches disableAppControlBarContentButtons on S_FaUserSettings.
   */
  disableAppControlBarContentButtons?: boolean | undefined

  /**
   * When defined, patches showTabBarScrollButtons on S_FaUserSettings.
   */
  showTabBarScrollButtons?: boolean | undefined

  /**
   * When defined, patches opened document tabs on S_FaOpenedDocuments for workspace tab bar previews.
   */
  openedDocuments?: {
    activeDocumentId: string | null
    tabs: I_faOpenedDocumentTab[]
  } | undefined

  /**
   * When defined, sets S_FaProjectNoteboard text via applyRoot (requires active project for control-bar dots).
   */
  projectNoteboardText?: string | undefined

  /**
   * When defined, replaces S_FaProjectHierarchyTree session worlds / tree / UI state for tree Component Playwright.
   */
  hierarchyTree?: I_faComponentTestingHierarchyTreeSeed | undefined

  /**
   * When defined, replaces S_FaProjectWorkspaceWorlds via hierarchy worlds for WorldList Component Playwright.
   */
  workspaceWorlds?: I_faProjectHierarchyTreeWorkspaceWorld[] | undefined

  /**
   * When defined, installs projectContent entity overrides for open/temp paths (null clears).
   */
  projectContentOverrides?: I_faComponentTestingProjectContentOverrides | null | undefined
}
