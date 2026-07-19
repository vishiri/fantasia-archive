/** Default opened-document tab status flag fields for tests and harness stubs. */
export const FA_OPENED_DOCUMENT_TAB_STATUS_FLAG_DEFAULTS = {
  isCategoryDraft: false,
  isDeadDraft: false,
  isFinishedDraft: false,
  isMinorDraft: false,
  savedIsCategory: false,
  savedIsDead: false,
  savedIsFinished: false,
  savedIsMinor: false
} as const

/** Default persisted document status flag fields for tests and harness stubs. */
export const FA_PROJECT_DOCUMENT_STATUS_FLAG_DEFAULTS = {
  isCategory: false,
  isDead: false,
  isFinished: false,
  isMinor: false
} as const

/** Default SQLite document row status flag columns for tests. */
export const FA_SQL_PROJECT_DOCUMENT_STATUS_FLAG_DEFAULTS = {
  is_category: 0,
  is_dead: 0,
  is_finished: 0,
  is_minor: 0
} as const
