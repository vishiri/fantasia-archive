import {
  FA_PROJECT_SLUG_MAX_LEN
} from 'app/src-electron/shared/faProjectConstants'

const DEFAULT_SAFE_BASENAME = 'fantasia-project'

/** Windows DOS device stems (without extension); comparison is ASCII case-insensitive. */
const WIN_RESERVED = new Set([
  'con',
  'prn',
  'aux',
  'nul',
  'com1',
  'com2',
  'com3',
  'com4',
  'com5',
  'com6',
  'com7',
  'com8',
  'com9',
  'lpt1',
  'lpt2',
  'lpt3',
  'lpt4',
  'lpt5',
  'lpt6',
  'lpt7',
  'lpt8',
  'lpt9'
])

const WINDOWS_AND_PATH_ILLEGAL_CHARS = /[<>:"/\\|?*]|\p{Cc}/gu

function basenameHasAlphanumeric (input: string): boolean {
  return /[\p{L}\p{N}]/u.test(input)
}

function stripTrailingDotsAndSpaces (input: string): string {
  let out = input
  while (out.length > 0 && /[.\u0020]$/.test(out)) {
    out = out.slice(0, -1)
  }
  return out
}

function truncateToMaxCodePoints (input: string, max: number): string {
  const chars = [...input]
  if (chars.length <= max) {
    return input
  }
  return chars.slice(0, max).join('')
}

function withReservedStemPrefix (basename: string): string {
  const key = basename.toLowerCase()
  if (!WIN_RESERVED.has(key)) {
    return basename
  }
  return `project-${basename}`
}

/**
 * Suggested filesystem basename (no '.faproject' yet): keeps normal spacing and casing when safe,
 * replaces path-illegal characters, strips emoji for broad compatibility, and applies Windows-safe
 * trimming of leading dots and trailing spaces or periods before the suggested length cap.
 */
export function faProjectSlugFromDisplayName (displayName: string): string {
  let s = displayName.trim()
  if (s.length === 0) {
    return DEFAULT_SAFE_BASENAME
  }
  s = s.normalize('NFKC')
  s = s.replace(/\p{Extended_Pictographic}/gu, '')
  s = s.replace(WINDOWS_AND_PATH_ILLEGAL_CHARS, ' ')
  s = s.replace(/\s+/g, ' ')
  s = s.trim()
  s = s.replace(/^\.+/u, '')
  s = stripTrailingDotsAndSpaces(s.trim())

  if (s.length === 0 || s === '.' || s === '..') {
    return DEFAULT_SAFE_BASENAME
  }

  if (!basenameHasAlphanumeric(s)) {
    return DEFAULT_SAFE_BASENAME
  }

  s = truncateToMaxCodePoints(s, FA_PROJECT_SLUG_MAX_LEN)
  s = stripTrailingDotsAndSpaces(s.trim())

  return withReservedStemPrefix(s)
}
