import { ZodError } from 'zod'

import type { I_faProjectCreateResult } from 'app/types/I_faProjectManagementDomain'

/**
 * Maps invalid project create IPC payloads to error results.
 */
export function faProjectCreateMapParseFailure (e: unknown): I_faProjectCreateResult {
  if (e instanceof TypeError) {
    return {
      errorMessage: e.message,
      errorName: e.name,
      outcome: 'error'
    }
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
  return {
    errorMessage: err.message,
    errorName: err.name,
    outcome: 'error'
  }
}
