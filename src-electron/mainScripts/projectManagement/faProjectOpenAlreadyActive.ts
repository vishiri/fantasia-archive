import {
  FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE,
  type I_faProjectManagementActiveSnapshot,
  type I_faProjectOpenResult
} from 'app/types/I_faProjectManagementDomain'

import {
  getFaProjectActiveDatabase,
  getFaProjectLastKnownActiveProjectFilePath
} from './faProjectActiveDatabase'
import {
  readFaProjectStoredDisplayName,
  readFaProjectStoredProjectUuid
} from './faProjectDbMigrate'
import { recordRecentProjectEntry } from './faRecentProjectListRuntime'

/**
 * Thrown when the file represents the same logical project (same project_uuid) as the already active database.
 */
export class FaProjectOpenRejectedAlreadyActiveError extends Error {
  constructor () {
    super('This project is already open in this session.')
    this.name = 'FaProjectOpenRejectedAlreadyActiveError'
  }
}

function readFaProjectActiveSnapshotForReuse (
  preferredFilePath: string
): I_faProjectManagementActiveSnapshot | null {
  const activeDbHandle = getFaProjectActiveDatabase()
  if (activeDbHandle === null) {
    return null
  }
  const mirroredPath = getFaProjectLastKnownActiveProjectFilePath()
  const filePath =
    mirroredPath !== null && mirroredPath.length > 0
      ? mirroredPath
      : preferredFilePath
  return {
    filePath,
    id: readFaProjectStoredProjectUuid(activeDbHandle),
    name: readFaProjectStoredDisplayName(activeDbHandle)
  }
}

/**
 * Maps an already-active open attempt to a successful idempotent IPC result, or a legacy error shape when main has no handle.
 */
export function buildFaProjectIdempotentOpenResult (
  filePath: string,
  rejected: FaProjectOpenRejectedAlreadyActiveError
): I_faProjectOpenResult {
  const snapshot = readFaProjectActiveSnapshotForReuse(filePath)
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
