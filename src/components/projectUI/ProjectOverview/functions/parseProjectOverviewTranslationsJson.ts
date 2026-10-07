/**
 * String entries from a parsed translations object. Non-objects become an empty map.
 */
export function mapProjectOverviewTranslationStrings (parsed: unknown): Record<string, string> {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {}
  }
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === 'string') {
      result[key] = value
    }
  }
  return result
}
