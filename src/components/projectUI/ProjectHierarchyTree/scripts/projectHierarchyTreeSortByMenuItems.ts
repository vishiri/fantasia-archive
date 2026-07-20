import type { I_faProjectHierarchyTreeSortByMenuItem } from 'app/types/I_faProjectHierarchyTreeDomain'

const SORT_ALPHABETICALLY_TITLE_KEY =
  'projectUI.projectHierarchyTree.contextMenu.sortAlphabetically'
const SORT_BY_CUSTOM_ORDER_TITLE_KEY =
  'projectUI.projectHierarchyTree.contextMenu.sortByCustomOrder'
const DETAIL_SCOPE_DIRECT_KEY =
  'projectUI.projectHierarchyTree.contextMenu.sortDetailScopeDirect'
const DETAIL_SCOPE_RECURSIVE_KEY =
  'projectUI.projectHierarchyTree.contextMenu.sortDetailScopeRecursive'
const DETAIL_NAME_ASC_KEY =
  'projectUI.projectHierarchyTree.contextMenu.sortDetailNameAsc'
const DETAIL_NAME_DESC_KEY =
  'projectUI.projectHierarchyTree.contextMenu.sortDetailNameDesc'
const DETAIL_CUSTOM_ORDER_ASC_KEY =
  'projectUI.projectHierarchyTree.contextMenu.sortDetailCustomOrderAsc'
const DETAIL_CUSTOM_ORDER_DESC_KEY =
  'projectUI.projectHierarchyTree.contextMenu.sortDetailCustomOrderDesc'

export const PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS: readonly I_faProjectHierarchyTreeSortByMenuItem[] = [
  {
    detailDirectionKey: DETAIL_NAME_ASC_KEY,
    detailScopeKey: DETAIL_SCOPE_DIRECT_KEY,
    direction: 'asc',
    id: 'namesDirectAsc',
    key: 'name',
    scope: 'direct',
    separatorBefore: 'none',
    titleKey: SORT_ALPHABETICALLY_TITLE_KEY
  },
  {
    detailDirectionKey: DETAIL_NAME_DESC_KEY,
    detailScopeKey: DETAIL_SCOPE_DIRECT_KEY,
    direction: 'desc',
    id: 'namesDirectDesc',
    key: 'name',
    scope: 'direct',
    separatorBefore: 'alt',
    titleKey: SORT_ALPHABETICALLY_TITLE_KEY
  },
  {
    detailDirectionKey: DETAIL_CUSTOM_ORDER_ASC_KEY,
    detailScopeKey: DETAIL_SCOPE_DIRECT_KEY,
    direction: 'asc',
    id: 'customOrderDirectAsc',
    key: 'customOrder',
    scope: 'direct',
    separatorBefore: 'alt',
    titleKey: SORT_BY_CUSTOM_ORDER_TITLE_KEY
  },
  {
    detailDirectionKey: DETAIL_CUSTOM_ORDER_DESC_KEY,
    detailScopeKey: DETAIL_SCOPE_DIRECT_KEY,
    direction: 'desc',
    id: 'customOrderDirectDesc',
    key: 'customOrder',
    scope: 'direct',
    separatorBefore: 'alt',
    titleKey: SORT_BY_CUSTOM_ORDER_TITLE_KEY
  },
  {
    detailDirectionKey: DETAIL_NAME_ASC_KEY,
    detailScopeKey: DETAIL_SCOPE_RECURSIVE_KEY,
    direction: 'asc',
    id: 'namesRecursiveAsc',
    key: 'name',
    scope: 'recursive',
    separatorBefore: 'group',
    titleKey: SORT_ALPHABETICALLY_TITLE_KEY
  },
  {
    detailDirectionKey: DETAIL_NAME_DESC_KEY,
    detailScopeKey: DETAIL_SCOPE_RECURSIVE_KEY,
    direction: 'desc',
    id: 'namesRecursiveDesc',
    key: 'name',
    scope: 'recursive',
    separatorBefore: 'alt',
    titleKey: SORT_ALPHABETICALLY_TITLE_KEY
  },
  {
    detailDirectionKey: DETAIL_CUSTOM_ORDER_ASC_KEY,
    detailScopeKey: DETAIL_SCOPE_RECURSIVE_KEY,
    direction: 'asc',
    id: 'customOrderRecursiveAsc',
    key: 'customOrder',
    scope: 'recursive',
    separatorBefore: 'alt',
    titleKey: SORT_BY_CUSTOM_ORDER_TITLE_KEY
  },
  {
    detailDirectionKey: DETAIL_CUSTOM_ORDER_DESC_KEY,
    detailScopeKey: DETAIL_SCOPE_RECURSIVE_KEY,
    direction: 'desc',
    id: 'customOrderRecursiveDesc',
    key: 'customOrder',
    scope: 'recursive',
    separatorBefore: 'alt',
    titleKey: SORT_BY_CUSTOM_ORDER_TITLE_KEY
  }
]
