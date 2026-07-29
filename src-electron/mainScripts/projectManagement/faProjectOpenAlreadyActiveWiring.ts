import {
  FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE,
  type I_faProjectManagementActiveSnapshot,
  type I_faProjectOpenResult
} from 'app/types/I_faProjectManagementDomain'

import { recordRecentProjectEntry } from './faRecentProjectListRuntimeWiring'

/**
 * Thrown when the file represents the same logical project (same project_uuid) as the already active database.
 */
export class FaProjectOpenRejectedAlreadyActiveError extends Error {
  constructor () {
    super('This project is already open in this session.')
    this.name = 'FaProjectOpenRejectedAlreadyActiveError'
  }
}

/**
 * Maps an already-active open attempt to a successful idempotent IPC result, or a legacy error shape when main has no handle.
 * Caller (allowlisted open path) supplies the active snapshot — this module does not touch active-DB getters.
 */
export function buildFaProjectIdempotentOpenResult (
  filePath: string,
  rejected: FaProjectOpenRejectedAlreadyActiveError,
  snapshot: I_faProjectManagementActiveSnapshot | null
): I_faProjectOpenResult {
  if (snapshot === null) {
    return {
      attemptedFilePath: filePath,
      errorMessage: rejected.message,
      errorName: FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE,
      outcome: 'error'
    }
  }
  recordRecentProjectEntry({
    filePath: snapshot.filePath,
    name: snapshot.name
  })
  return {
    idempotentReuse: true,
    outcome: 'opened',
    project: snapshot
  }
}
