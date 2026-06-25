/**
 * Drops keys whose values are 'undefined' so Zod optional fields match
 * 'exactOptionalPropertyTypes' domain interfaces (absent vs undefined).
 */
export function dropUndefinedRecordValues<T extends Record<string, unknown>> (
  record: T
): T {
  const out: Record<string, unknown> = {}

  for (const key of Object.keys(record) as Array<keyof T>) {
    const value = record[key]

    if (value !== undefined) {
      out[key as string] = value
    }
  }

  return out as T
}
