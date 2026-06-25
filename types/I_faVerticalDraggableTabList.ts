import type {
  T_faVerticalDraggableTabsTabJustifyContent,
  T_faVerticalDraggableTabsTabLabelTextTransform,
  T_faVerticalDraggableTabsTabTextAlign
} from 'app/types/I_faVerticalDraggableTabs'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

/**
 * Shared vertical draggable tab column host (FaVerticalDraggableTabList).
 */
export interface I_faVerticalDraggableTabListIdentifiedItem {
  id: string
}

export interface I_faVerticalDraggableTabListProps<T extends I_faVerticalDraggableTabListIdentifiedItem> {
  addButtonLabelKey: string
  blockClassSuffix: string
  currentLanguageCode: T_faUserSettingsLanguageCode
  dense?: boolean | undefined
  dragIdDataAttribute: string
  emptyFilteredKey: string
  filterAriaLabelKey: string
  filterClearAriaLabelKey: string
  filterPlaceholderKey: string
  items: T[]
  selectedId: string | null
  tabJustifyContent?: T_faVerticalDraggableTabsTabJustifyContent | undefined
  tabLabelFontSize?: string | undefined
  tabLabelTextTransform?: T_faVerticalDraggableTabsTabLabelTextTransform | undefined
  tabListWidthPx?: number | undefined
  tabPadding?: string | undefined
  tabTextAlign?: T_faVerticalDraggableTabsTabTextAlign | undefined
  testLocatorAddButton: string
  testLocatorFilterClear: string
  testLocatorFilterEmpty: string
  testLocatorFilterInput: string
  testLocatorList: string
}
