import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'
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
  expandedNodeIds: z.array(z.string().min(1).max(64)).optional(),
  scrollTopPx: z.number().finite().min(0).optional()
}).strict()

function isPlainRecord (value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

/**
 * Parses persisted hierarchy_tree_ui_state JSON from project_data KV.
 */
export function parseFaProjectHierarchyTreeUiStateJson (
  raw: string
): I_faProjectHierarchyTreeUiState {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      schemaVersion: 1,
      expandedNodeIds: [],
      scrollTopPx: 0
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
