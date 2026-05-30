import type {
  I_faActionHistoryEntry,
  I_faActionHistoryEntryStatusPatch
} from 'app/types/I_faActionManagerDomain'

/**
 * Hard cap for the session-only action history ring buffer; oldest entries are dropped on overflow.
 */
export const FA_ACTION_HISTORY_MAX = 500

/**
 * Mutates 'entry' in place with whichever patch fields are defined.
 */
export function applyFaActionHistoryEntryStatusPatch (
  entry: I_faActionHistoryEntry,
  patch: I_faActionHistoryEntryStatusPatch
): void {
  if (patch.errorMessage !== undefined) {
    entry.errorMessage = patch.errorMessage
  }
  if (patch.finishedAt !== undefined) {
    entry.finishedAt = patch.finishedAt
  }
  if (patch.payloadPreview !== undefined) {
    entry.payloadPreview = patch.payloadPreview
  }
  if (patch.startedAt !== undefined) {
    entry.startedAt = patch.startedAt
  }
  if (patch.status !== undefined) {
    entry.status = patch.status
  }
}

/**
 * Drops the oldest rows so length never exceeds 'FA_ACTION_HISTORY_MAX' (ring buffer behavior).
 */
export function trimFaActionHistoryRingBuffer (entries: I_faActionHistoryEntry[]): void {
  if (entries.length <= FA_ACTION_HISTORY_MAX) {
    return
  }
  const removeCount = entries.length - FA_ACTION_HISTORY_MAX
  entries.splice(0, removeCount)
}
