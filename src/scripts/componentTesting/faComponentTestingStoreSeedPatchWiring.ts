import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaProjectWorkspaceWorlds } from 'app/src/stores/S_FaProjectWorkspaceWorlds'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { applyFaAppThemeToDocument } from 'app/src/scripts/appInternals/faAppThemeApplyWiring'
import { applyFaHideDeadCrossThroughToDocument } from 'app/src/scripts/appInternals/faHideDeadCrossThroughApplyWiring'
import { setFaComponentTestingProjectContentOverrides } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { Pinia } from 'app/types/I_vuePiniaInjected'

const USER_SETTINGS_BOOLEAN_SEED_KEYS = [
  'hidePlushes',
  'hideTooltipsProject',
  'disableAppControlBar',
  'disableAppControlBarGuides',
  'disableAppControlBarFunctionButtons',
  'disableAppControlBarContentButtons',
  'showTabBarScrollButtons',
  'hideTabCloseButton',
  'hideTreeIconAddUnder',
  'hideTreeIconEdit',
  'hideTreeIconView',
  'hideTreeOrderNumbers',
  'hideTreeLines',
  'noProjectName',
  'hideHierarchyTree',
  'forceSublevelCollapseInTree',
  'disableDocumentCounts',
  'disableCategoryCount',
  'invertCategoryPosition',
  'doubleDashDocCount',
  'hideDeadCrossThrough'
] as const satisfies ReadonlyArray<keyof I_faComponentTestingStoreSeed & keyof I_faUserSettings>

export function patchFaComponentTestingStores (
  pinia: Pinia,
  seed: I_faComponentTestingStoreSeed
): void {
  if (seed.activeProject !== undefined) {
    const activeProjectStore = S_FaActiveProject(pinia)
    if (seed.activeProject === null) {
      activeProjectStore.clearActiveProject()
    } else {
      activeProjectStore.setActiveProject(seed.activeProject)
    }
  }

  const hasBooleanUserSettingSeed = USER_SETTINGS_BOOLEAN_SEED_KEYS.some((key) => {
    return seed[key] !== undefined
  })

  if (hasBooleanUserSettingSeed || seed.appTheme !== undefined) {
    const settingsStore = S_FaUserSettings(pinia)
    const nextSettings = {
      ...settingsStore.settings
    }

    for (const key of USER_SETTINGS_BOOLEAN_SEED_KEYS) {
      const value = seed[key]
      if (value !== undefined) {
        nextSettings[key] = value
      }
    }

    if (seed.appTheme !== undefined) {
      nextSettings.appTheme = seed.appTheme
    }

    settingsStore.$patch({
      settings: nextSettings
    })

    if (seed.appTheme !== undefined) {
      applyFaAppThemeToDocument(seed.appTheme)
    }

    if (seed.hideDeadCrossThrough !== undefined) {
      applyFaHideDeadCrossThroughToDocument(seed.hideDeadCrossThrough)
    }
  }

  if (seed.openedDocuments !== undefined) {
    const openedDocumentsStore = S_FaOpenedDocuments(pinia)
    openedDocumentsStore.replaceSessionForComponentTesting({
      activeDocumentId: seed.openedDocuments.activeDocumentId,
      tabs: seed.openedDocuments.tabs
    })
  }

  if (seed.appNoteboardText !== undefined) {
    S_FaAppNoteboard(pinia).applyRoot({
      frame: null,
      schemaVersion: 1,
      text: seed.appNoteboardText
    })
  }

  if (seed.projectNoteboardText !== undefined) {
    S_FaProjectNoteboard(pinia).applyRoot({
      frame: null,
      schemaVersion: 1,
      text: seed.projectNoteboardText
    })
  }

  if (seed.hierarchyTree !== undefined) {
    S_FaProjectHierarchyTree(pinia).replaceSessionForComponentTesting(seed.hierarchyTree)
  }

  if (seed.workspaceWorlds !== undefined) {
    S_FaProjectWorkspaceWorlds(pinia).replaceSessionForComponentTesting(seed.workspaceWorlds)
  }

  if (seed.projectContentOverrides !== undefined) {
    setFaComponentTestingProjectContentOverrides(
      seed.projectContentOverrides === null
        ? null
        : structuredClone(seed.projectContentOverrides)
    )
  }
}
