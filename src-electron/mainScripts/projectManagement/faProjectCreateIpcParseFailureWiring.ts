import { ZodError } from 'zod'

import type { I_faProjectCreateResult } from 'app/types/I_faProjectManagementDomain'

function faProjectCreateErrorResult (
  errorMessage: string,
  errorName: string
): I_faProjectCreateResult {
  const outcome = 'error' as const
  return {
    errorMessage,
    errorName,
    outcome
  }
}

/**
 * Maps invalid project create IPC payloads to error results.
 */
export function faProjectCreateMapParseFailure (e: unknown): I_faProjectCreateResult {
  if (e instanceof TypeError) {
    return faProjectCreateErrorResult(e.message, e.name)
  }
  if (e instanceof ZodError) {
    const first = e.issues[0]
    const msg = first?.message ?? 'invalid project create input'
    return {
      errorMessage: msg,
      errorName: 'ZodError',
      outcome: 'error'
    }
  }
  const err = e instanceof Error ? e : new Error(String(e))
  return faProjectCreateErrorResult(err.message, err.name)
}
