import { expect, test } from 'vitest'

import {
  PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_ANIMATION_MS,
  PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_FILTER,
  projectAppControlBarTabsSortableDragOptions
} from '../projectAppControlBarTabsSortableDragOptionsWiring'

test('Test that projectAppControlBarTabsSortableDragOptions stay horizontal with close-button filter', () => {
  expect(PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_ANIMATION_MS).toBe(150)
  expect(PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_FILTER).toBe('.projectAppControlBarTabs__tabClose')
  expect(projectAppControlBarTabsSortableDragOptions.direction).toBe('horizontal')
  expect(projectAppControlBarTabsSortableDragOptions.filter).toBe(PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_FILTER)
  expect(projectAppControlBarTabsSortableDragOptions.preventOnFilter).toBe(true)
  expect(projectAppControlBarTabsSortableDragOptions.forceFallback).toBe(true)
})
