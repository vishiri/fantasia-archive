import type Database from 'better-sqlite3'

export function readFaProjectDbUserVersion (db: Database): number {
  const rawVer = db.pragma('user_version', { simple: true })
  const current = typeof rawVer === 'number' ? rawVer : Number(rawVer)
  return Number.isFinite(current) ? current : 0
}

export function runFaProjectDbMigrationStep (
  db: Database,
  expectedVersion: number,
  supportedMaxVersion: number,
  migrate: () => void
): void {
  const currentVersion = readFaProjectDbUserVersion(db)
  if (currentVersion === expectedVersion && supportedMaxVersion >= expectedVersion + 1) {
    const runStep = db.transaction(() => {
      migrate()
    })
    runStep()
  }
}
