export function pathLooksLikeFaconfigFile (filePath: string): boolean {
  return filePath.toLowerCase().endsWith('.faconfig')
}

export function purgeExpiredStagedImportSessions (
  sessions: Map<string, { expiresAt: number }>,
  nowMs: number
): void {
  for (const [k, s] of sessions.entries()) {
    if (s.expiresAt < nowMs) {
      sessions.delete(k)
    }
  }
}
