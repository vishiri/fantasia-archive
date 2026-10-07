import { Result } from 'neverthrow'
import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'
import { isPlainRecord } from 'app/src-electron/shared/faPlainRecord'
import type {
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeUiStatePatch
} from 'app/types/I_faProjectHierarchyTreeDomain'

export const faProjectHierarchyTreeUiStateSchema = z.object({
  schemaVersion: z.literal(1),
  expandedNodeIds: z.array(z.string().min(1).max(255)),
  scrollTopPx: z.number().finite().min(0)
}).strict()

export const faProjectHierarchyTreeUiStatePatchSchema = z.object({
  expandedNodeIds: z.array(z.string().min(1).max(255)).optional(),
  expandedNodeIdsBaseJson: z.string().max(100_000).optional(),
  scrollTopPx: z.number().finite().min(0).optional()
}).strict()

/**
 * Parses persisted hierarchy_tree_ui_state JSON from project_data KV.
 */
export function parseFaProjectHierarchyTreeUiStateJson (
  raw: string
): I_faProjectHierarchyTreeUiState {
  const parsed = Result.fromThrowable(
    () => JSON.parse(raw) as unknown,
    () => undefined
  )().unwrapOr(undefined)
  if (parsed === undefined) {
    const schemaVersion = 1 as const
    const expandedNodeIds: string[] = []
    const scrollTopPx = 0
    return {
      schemaVersion,
      expandedNodeIds,
      scrollTopPx
    }
  }
  return faProjectHierarchyTreeUiStateSchema.parse(parsed) as I_faProjectHierarchyTreeUiState
}

/**
 * Serializes hierarchy tree UI state for project_data KV storage.
 */
export function serializeFaProjectHierarchyTreeUiStateJson (
  state: I_faProjectHierarchyTreeUiState
): string {
  const validated = faProjectHierarchyTreeUiStateSchema.parse(state)
  return JSON.stringify(validated)
}

/**
 * Parses an IPC payload patching hierarchy tree UI state. Throws when the payload fails Zod.
 */
export function parseFaProjectHierarchyTreeUiStatePatch (
  patch: unknown
): I_faProjectHierarchyTreeUiStatePatch {
  if (!isPlainRecord(patch)) {
    throw new TypeError('Hierarchy tree UI state patch must be a plain object')
  }
  return dropUndefinedRecordValues(
    faProjectHierarchyTreeUiStatePatchSchema.parse(patch)
  ) as I_faProjectHierarchyTreeUiStatePatch
}
