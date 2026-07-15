import type {
  I_hierarchyTreeDocumentOpenEditSteps,
  T_hierarchyTreeDocumentContextMenuMode
} from 'app/types/I_faHierarchyTreeDocumentContextMenuDomain'

/**
 * Resolves open/edit steps for hierarchy tree document context menu actions.
 */
export function resolveHierarchyTreeDocumentOpenEditSteps (input: {
  mode: T_hierarchyTreeDocumentContextMenuMode
  tabEditState: boolean | null
  tabIsOpen: boolean
}): I_hierarchyTreeDocumentOpenEditSteps {
  if (input.mode === 'open') {
    return {
      shouldEnterEditMode: false,
      shouldFocusTab: true,
      shouldOpenFromTree: !input.tabIsOpen
    }
  }

  if (!input.tabIsOpen) {
    return {
      shouldEnterEditMode: true,
      shouldFocusTab: true,
      shouldOpenFromTree: true
    }
  }

  if (input.tabEditState === true) {
    return {
      shouldEnterEditMode: false,
      shouldFocusTab: true,
      shouldOpenFromTree: false
    }
  }

  return {
    shouldEnterEditMode: true,
    shouldFocusTab: true,
    shouldOpenFromTree: false
  }
}
