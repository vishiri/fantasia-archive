import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { VueDraggable } from 'vue-draggable-plus'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/appRouting_manager'
import {
  applyFaVerticalDraggableTabsDocumentDragCursor,
  clearFaVerticalDraggableTabsDocumentDragCursor,
  hideNativeSortableDragGhost
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import { noteboardHasContent } from 'app/src/scripts/floatingWindows/functions/shouldAutoOpenFilledNoteboard'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/keybinds_manager'

import { createUseProjectAppControlBar } from '../functions/createUseProjectAppControlBar'
import { createUseProjectAppControlBarOpenedTabsSortable } from '../functions/createUseProjectAppControlBarOpenedTabsSortable'
import {
  resolveProjectAppControlBarSaveButtonColor,
  resolveShowProjectAppControlBarDeleteButton,
  resolveShowProjectAppControlBarEditButton,
  resolveShowProjectAppControlBarSaveButtons
} from '../functions/projectAppControlBarEditMode'
import {
  FA_PROJECT_APP_CONTROL_BAR_HEADER_MOUNT_SELECTOR,
  resolveActiveDocumentTabName,
  resolveDocumentTabLabelFromOpenedTab,
  resolveShowAppControlBarStrip,
  resolveShowDocumentTabs
} from '../functions/projectAppControlBarVisibility'
import { buildProjectAppControlBarAssembleInput } from './projectAppControlBarAssembleInput'
import {
  getProjectAppControlBarKeybindsSnapshot
} from './projectAppControlBarManagerDepsWiring'
import { assembleProjectAppControlBarApi } from './projectAppControlBarSessionWiring'
import { createProjectAppControlBarI18nTooltips } from './projectAppControlBarI18nTooltipsWiring'
import { resolveProjectAppControlBarHideHierarchyTree } from './projectAppControlBarHideHierarchyTreeWiring'
import { onProjectAppControlBarTabsWheel } from './projectAppControlBarTabsWheelScrollWiring'
import {
  startProjectAppControlBarTabsDragEdgeScroll,
  stopProjectAppControlBarTabsDragEdgeScroll
} from './projectAppControlBarTabsDragEdgeScrollWiring'
import {
  PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_ANIMATION_MS,
  projectAppControlBarTabsSortableDragOptions
} from './projectAppControlBarTabsSortableDragOptionsWiring'

export {
  FA_PROJECT_APP_CONTROL_BAR_HEADER_MOUNT_SELECTOR
}

export {
  PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_ANIMATION_MS,
  VueDraggable,
  applyFaVerticalDraggableTabsDocumentDragCursor,
  clearFaVerticalDraggableTabsDocumentDragCursor,
  hideNativeSortableDragGhost,
  onProjectAppControlBarTabsWheel,
  projectAppControlBarTabsSortableDragOptions,
  startProjectAppControlBarTabsDragEdgeScroll,
  stopProjectAppControlBarTabsDragEdgeScroll
}

export const useProjectAppControlBarOpenedTabsSortable = createUseProjectAppControlBarOpenedTabsSortable({
  ref,
  watch
})

export const useProjectAppControlBarI18nTooltips = createProjectAppControlBarI18nTooltips({
  computed,
  useI18n
})

export const useProjectAppControlBar = createUseProjectAppControlBar({
  assembleProjectAppControlBarApi,
  buildProjectAppControlBarAssembleInput,
  computed,
  resolveHideHierarchyTree: resolveProjectAppControlBarHideHierarchyTree,
  resolveActiveDocumentTabName,
  resolveDocumentTabLabelFromOpenedTab,
  resolveFaDocumentWorkspaceRouteDocumentId,
  resolveShowAppControlBarStrip,
  resolveShowDocumentTabs,
  resolveShowProjectAppControlBarEditButton,
  resolveShowProjectAppControlBarDeleteButton,
  resolveShowProjectAppControlBarSaveButtons,
  resolveProjectAppControlBarSaveButtonColor,
  formatFaKeybindCommandLabelFromSnapshot,
  getKeybindsSnapshot: getProjectAppControlBarKeybindsSnapshot,
  noteboardHasContent,
  runFaAction,
  S_FaActiveProject,
  S_FaAppNoteboard,
  S_FaOpenedDocuments,
  S_FaProjectHierarchyTree,
  S_FaProjectNoteboard,
  S_FaUserSettings,
  storeToRefs,
  useRoute
})
