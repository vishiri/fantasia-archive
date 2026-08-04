/**
 * Strips a leading 'v' / 'V' and trims so tags like 'v2.5.0' become '2.5.0'.
 * @param raw - Version or tag string from the app or GitHub
 * @returns Normalized version string, or empty when input is blank after trim
 */
export function stripFaSemverVersion (raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return ''
  }
  if (trimmed.startsWith('v') || trimmed.startsWith('V')) {
    return trimmed.slice(1).trim()
  }
  return trimmed
}

/**
 * Parses major.minor.patch (extra segments ignored) into three numbers.
 * @param stripped - Version already passed through stripFaSemverVersion
 * @returns Triple or null when not parseable as semver-like numbers
 */
export function parseFaSemverTriple (
  stripped: string
): readonly [number, number, number] | null {
  if (stripped.length === 0) {
    return null
  }
  const core = stripped.split('+')[0]!.split('-')[0]!
  const parts = core.split('.')
  const major = Number(parts[0])
  const minor = Number(parts[1] ?? '0')
  const patch = Number(parts[2] ?? '0')
  if (!Number.isFinite(major) || !Number.isFinite(minor) || !Number.isFinite(patch)) {
    return null
  }
  return [major, minor, patch]
}

/**
 * True when remote stripped version is strictly greater than local.
 * @param localStripped - Local app version (stripped)
 * @param remoteStripped - Remote release version (stripped)
 * @returns Whether remote is newer; false when either side fails to parse
 */
export function isFaRemoteSemverNewer (
  localStripped: string,
  remoteStripped: string
): boolean {
  const local = parseFaSemverTriple(localStripped)
  const remote = parseFaSemverTriple(remoteStripped)
  if (local === null || remote === null) {
    return false
  }
  if (remote[0] !== local[0]) {
    return remote[0] > local[0]
  }
  if (remote[1] !== local[1]) {
    return remote[1] > local[1]
  }
  return remote[2] > local[2]
}
