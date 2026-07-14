import { expect, test } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import { buildProjectDocumentControlBarTabContextMenuLabels } from '../projectDocumentControlBarTabContextMenuLabels'

function computed <T> (getter: () => T): I_computedRef<T> {
  return {
    get value () {
      return getter()
    }
  } as I_computedRef<T>
}

test('Test that buildProjectDocumentControlBarTabContextMenuLabels exposes translated menu labels', () => {
  const labels = buildProjectDocumentControlBarTabContextMenuLabels({
    computed,
    translateBrowseOpenedTabs: () => 'Browse opened tabs',
    translateCloseAllTabsWithoutChanges: () => 'Close all tabs without changes',
    translateCloseAllTabsWithoutChangesExceptThisOne: () => 'Close all tabs without changes except for this one',
    translateCloseThisTab: () => 'Close this tab',
    translateCopyBackgroundColor: () => 'Copy background color',
    translateCopyName: () => 'Copy name',
    translateCopyTextColor: () => 'Copy text color',
    translateDeleteThisDocument: () => 'Delete this document',
    translateForceCloseAllTabs: () => 'Force close all tabs',
    translateForceCloseAllTabsExceptThisOne: () => 'Force close all tabs except for this one',
    translateMoveTabLeft: () => 'Move tab left',
    translateMoveTabRight: () => 'Move tab right'
  })

  expect(labels.browseOpenedTabsLabel.value).toBe('Browse opened tabs')
  expect(labels.copyBackgroundColorLabel.value).toBe('Copy background color')
  expect(labels.copyNameLabel.value).toBe('Copy name')
  expect(labels.copyTextColorLabel.value).toBe('Copy text color')
  expect(labels.moveTabLeftLabel.value).toBe('Move tab left')
  expect(labels.moveTabRightLabel.value).toBe('Move tab right')
  expect(labels.closeThisTabLabel.value).toBe('Close this tab')
  expect(labels.closeAllTabsWithoutChangesExceptThisOneLabel.value)
    .toBe('Close all tabs without changes except for this one')
  expect(labels.closeAllTabsWithoutChangesLabel.value).toBe('Close all tabs without changes')
  expect(labels.forceCloseAllTabsExceptThisOneLabel.value)
    .toBe('Force close all tabs except for this one')
  expect(labels.forceCloseAllTabsLabel.value).toBe('Force close all tabs')
  expect(labels.deleteThisDocumentLabel.value).toBe('Delete this document')
})
