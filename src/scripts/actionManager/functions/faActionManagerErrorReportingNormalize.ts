import type { I_faActionQueueEntry } from 'app/types/I_faActionManagerDomain'

export function normalizeFaActionError (error: unknown): {
  name: string
  message: string
  stack?: string
} {
  if (error instanceof Error) {
    const result: { name: string, message: string, stack?: string } = {
      message: error.message,
      name: error.name
    }
    if (typeof error.stack === 'string') {
      result.stack = error.stack
    }
    return result
  }
  if (typeof error === 'string') {
    return {
      message: error,
      name: 'Error'
    }
  }
  return {
    message: String(error),
    name: 'Error'
  }
}

export function readFaProjectOpenFailedShape (error: unknown): {
  attemptedFilePath?: string
  notifyType?: 'negative' | 'warning'
} | null {
  if (!(error instanceof Error) || error.name !== 'FaProjectOpenFailedError') {
    return null
  }
  const record = error as Error & {
    attemptedFilePath?: unknown
    notifyType?: unknown
  }
  const shape: {
    attemptedFilePath?: string
    notifyType?: 'negative' | 'warning'
  } = {}
  if (typeof record.attemptedFilePath === 'string') {
    const trimmed = record.attemptedFilePath.trim()
    if (trimmed.length > 0) {
      shape.attemptedFilePath = trimmed
    }
  }
  if (record.notifyType === 'warning' || record.notifyType === 'negative') {
    shape.notifyType = record.notifyType
  }
  return shape
}

function readLoadExistingProjectPayloadFilePath (payload: unknown): string | undefined {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return undefined
  }
  const filePath = (payload as { filePath?: unknown }).filePath
  if (typeof filePath !== 'string') {
    return undefined
  }
  const trimmed = filePath.trim()
  if (trimmed.length === 0) {
    return undefined
  }
  return trimmed
}

export function resolveFaActionFailureNotifyCaption (
  entry: I_faActionQueueEntry,
  error: unknown,
  normalizedMessage: string
): string {
  const projectOpenFailed = readFaProjectOpenFailedShape(error)
  if (projectOpenFailed !== null) {
    if (projectOpenFailed.notifyType === 'warning') {
      return normalizedMessage
    }
    if (projectOpenFailed.attemptedFilePath !== undefined) {
      return projectOpenFailed.attemptedFilePath
    }
  }

  if (entry.id === 'loadExistingProject') {
    const filePath = readLoadExistingProjectPayloadFilePath(entry.payload)
    if (filePath !== undefined) {
      return filePath
    }
  }

  return normalizedMessage
}
