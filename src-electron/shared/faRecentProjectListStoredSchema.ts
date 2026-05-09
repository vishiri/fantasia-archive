import { z } from 'zod'

import {
  FA_PROJECT_DISPLAY_NAME_MAX_LEN
} from 'app/src-electron/shared/faProjectConstants'

const recentProjectEntryStoredSchema = z.object({
  filePath: z.string(),
  name: z
    .string()
    .max(FA_PROJECT_DISPLAY_NAME_MAX_LEN, 'name is too long')
}).strict()

const recentProjectListStoredSchema = z.object({
  recentProjects: z.array(recentProjectEntryStoredSchema).optional()
}).strip()

/**
 * Parses persisted electron-store blob for recent projects; unknown keys stripped.
 */
export function parseFaRecentProjectListStored (raw: unknown): Array<{ filePath: string, name: string }> {
  const parsed = recentProjectListStoredSchema.safeParse(raw)
  if (!parsed.success) {
    return []
  }
  return parsed.data.recentProjects ?? []
}
