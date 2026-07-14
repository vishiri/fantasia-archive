import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function buildProjectDocumentControlBarTabContextMenuLabels (input: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  translateBrowseOpenedTabs: () => string
  translateCloseAllTabsWithoutChanges: () => string
  translateCloseAllTabsWithoutChangesExceptThisOne: () => string
  translateCloseThisTab: () => string
  translateCopyBackgroundColor: () => string
  translateCopyName: () => string
  translateCopyTextColor: () => string
  translateDeleteThisDocument: () => string
  translateForceCloseAllTabs: () => string
  translateForceCloseAllTabsExceptThisOne: () => string
  translateMoveTabLeft: () => string
  translateMoveTabRight: () => string
}): {
    browseOpenedTabsLabel: I_computedRef<string>
    closeAllTabsWithoutChangesExceptThisOneLabel: I_computedRef<string>
    closeAllTabsWithoutChangesLabel: I_computedRef<string>
    closeThisTabLabel: I_computedRef<string>
    copyBackgroundColorLabel: I_computedRef<string>
    copyNameLabel: I_computedRef<string>
    copyTextColorLabel: I_computedRef<string>
    deleteThisDocumentLabel: I_computedRef<string>
    forceCloseAllTabsExceptThisOneLabel: I_computedRef<string>
    forceCloseAllTabsLabel: I_computedRef<string>
    moveTabLeftLabel: I_computedRef<string>
    moveTabRightLabel: I_computedRef<string>
  } {
  const browseOpenedTabsLabel = input.computed(() => {
    return input.translateBrowseOpenedTabs()
  })

  const copyNameLabel = input.computed(() => {
    return input.translateCopyName()
  })

  const copyTextColorLabel = input.computed(() => {
    return input.translateCopyTextColor()
  })

  const copyBackgroundColorLabel = input.computed(() => {
    return input.translateCopyBackgroundColor()
  })

  const moveTabLeftLabel = input.computed(() => {
    return input.translateMoveTabLeft()
  })

  const moveTabRightLabel = input.computed(() => {
    return input.translateMoveTabRight()
  })

  const closeThisTabLabel = input.computed(() => {
    return input.translateCloseThisTab()
  })

  const closeAllTabsWithoutChangesExceptThisOneLabel = input.computed(() => {
    return input.translateCloseAllTabsWithoutChangesExceptThisOne()
  })

  const closeAllTabsWithoutChangesLabel = input.computed(() => {
    return input.translateCloseAllTabsWithoutChanges()
  })

  const forceCloseAllTabsExceptThisOneLabel = input.computed(() => {
    return input.translateForceCloseAllTabsExceptThisOne()
  })

  const forceCloseAllTabsLabel = input.computed(() => {
    return input.translateForceCloseAllTabs()
  })

  const deleteThisDocumentLabel = input.computed(() => {
    return input.translateDeleteThisDocument()
  })

  return {
    browseOpenedTabsLabel,
    closeAllTabsWithoutChangesExceptThisOneLabel,
    closeAllTabsWithoutChangesLabel,
    closeThisTabLabel,
    copyBackgroundColorLabel,
    copyNameLabel,
    copyTextColorLabel,
    deleteThisDocumentLabel,
    forceCloseAllTabsExceptThisOneLabel,
    forceCloseAllTabsLabel,
    moveTabLeftLabel,
    moveTabRightLabel
  }
}
