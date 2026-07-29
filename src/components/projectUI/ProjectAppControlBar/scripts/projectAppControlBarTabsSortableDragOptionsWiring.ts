import {
  FA_VERTICAL_DRAGGABLE_TABS_SORTABLE_ANIMATION_MS,
  faVerticalDraggableTabsSortableDragOptions
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'

/** Exclude close control so clicks still close without starting a drag. */
export const PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_FILTER =
  '.projectAppControlBarTabs__tabClose'

export const PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_ANIMATION_MS =
  FA_VERTICAL_DRAGGABLE_TABS_SORTABLE_ANIMATION_MS

export const projectAppControlBarTabsSortableDragOptions = {
  ...faVerticalDraggableTabsSortableDragOptions,
  direction: 'horizontal',
  filter: PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_FILTER,
  preventOnFilter: true
} as const
