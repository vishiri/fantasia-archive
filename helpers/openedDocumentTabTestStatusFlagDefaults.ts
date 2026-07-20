/** Default opened-document tab status flag fields for tests and harness stubs. */
export const FA_OPENED_DOCUMENT_TAB_STATUS_FLAG_DEFAULTS = {
  isCategoryDraft: false,
  isDeadDraft: false,
  isFinishedDraft: false,
  isMinorDraft: false,
  savedIsCategory: false,
  savedIsDead: false,
  savedIsFinished: false,
  savedIsMinor: false,
  savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  treeOrderNumberDraft: ''
} as const

/** Default opened-document tab tree order fields for tests and harness stubs. */
export const FA_OPENED_DOCUMENT_TAB_TREE_ORDER_NUMBER_DEFAULTS = {
  savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  treeOrderNumberDraft: ''
} as const

/** Default persisted document status flag fields for tests and harness stubs. */
export const FA_PROJECT_DOCUMENT_STATUS_FLAG_DEFAULTS = {
  isCategory: false,
  isDead: false,
  isFinished: false,
  isMinor: false,
  treeOrderNumber: Number.MIN_SAFE_INTEGER
} as const

/** Default SQLite document row status flag columns for tests. */
export const FA_SQL_PROJECT_DOCUMENT_STATUS_FLAG_DEFAULTS = {
  is_category: 0,
  is_dead: 0,
  is_finished: 0,
  is_minor: 0,
  tree_order_number: Number.MIN_SAFE_INTEGER
} as const

/** Default SQLite document row tree order column for tests. */
export const FA_SQL_PROJECT_DOCUMENT_TREE_ORDER_NUMBER_DEFAULTS = {
  tree_order_number: Number.MIN_SAFE_INTEGER
} as const
