/**
 * Action Monitor preview cap from Fantasia Archive Settings and row outcome.
 * Error and warning rows always log the full payload; the setting applies elsewhere.
 */
export function resolveFaActionPayloadPreviewMaxLengthForLogging (
  logFullActivityPayload: boolean,
  isErrorOrWarning: boolean,
  defaultMaxLength: number
): number {
  if (isErrorOrWarning === true || logFullActivityPayload === true) {
    return Number.POSITIVE_INFINITY
  }
  return defaultMaxLength
}
