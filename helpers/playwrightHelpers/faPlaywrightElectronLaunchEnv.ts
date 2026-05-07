import process from 'node:process'

/**
 * Copies defined string values from a process-style map so the result can be passed to Playwright
 * 'electron.launch({ env })', which requires string values only (see playwright-core envObjectToArray).
 */
export function pickDefinedEnvStringValues (
  source: Record<string, string | undefined>
): Record<string, string> {
  const base: Record<string, string> = {}
  for (const name in source) {
    if (!Object.is(source[name], undefined)) {
      const value = source[name]
      base[name] = String(value)
    }
  }
  return base
}

/**
 * Playwright 'electron.launch({ env })' replaces the child process env when 'env' is set; Electron
 * and native helpers still expect inherited vars (PATH, SystemRoot on Windows, APPDATA, TMPDIR, NODE_OPTIONS, etc.).
 * The Playwright Electron client merges with 'envObjectToArray' (for...in keys), then the server merges again.
 */
export function buildFaPlaywrightElectronLaunchEnv (
  overrides: Record<string, string>
): Record<string, string> {
  const inheritedKeys = pickDefinedEnvStringValues(
    process.env as Record<string, string | undefined>
  )
  const mergedEnv: Record<string, string> = {
    ...inheritedKeys,
    ...overrides
  }
  return mergedEnv
}
