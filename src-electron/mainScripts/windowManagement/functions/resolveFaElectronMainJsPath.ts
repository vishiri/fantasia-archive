/**
 * Picks the main-process script path from argv when present.
 */
export function pickElectronMainScriptFromArgv (argv: string[]): string | null {
  const scriptArg = argv[1]
  if (typeof scriptArg === 'string' && scriptArg.length > 0) {
    return scriptArg
  }
  return null
}
