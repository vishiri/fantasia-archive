/** Open vs edit intent for hierarchy tree document context menu actions. */
export type T_hierarchyTreeDocumentContextMenuMode = 'open' | 'edit'

/** Resolved open/focus/edit steps for hierarchy tree document context menu actions. */
export interface I_hierarchyTreeDocumentOpenEditSteps {
  shouldEnterEditMode: boolean
  shouldFocusTab: boolean
  shouldOpenFromTree: boolean
}
