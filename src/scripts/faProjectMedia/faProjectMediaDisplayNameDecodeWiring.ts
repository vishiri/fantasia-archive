import { Result } from 'neverthrow'

const decodeFaProjectMediaUrlSegment = Result.fromThrowable(
  (segment: string) => decodeURIComponent(segment),
  () => null
)

/**
 * Decodes one URL path segment. A bad percent-encoding stays as written.
 */
export function decodeFaProjectMediaUrlSegmentOrRaw (segment: string): string {
  return decodeFaProjectMediaUrlSegment(segment).unwrapOr(null) ?? segment
}
