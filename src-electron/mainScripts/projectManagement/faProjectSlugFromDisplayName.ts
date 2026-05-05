import path from 'node:path'

import {
  FA_PROJECT_SLUG_MAX_LEN
} from 'app/src-electron/shared/faProjectConstants'

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

/**
 * Builds a filesystem-safe lowercase dash slug from user-visible project name.
 */
export function faProjectSlugFromDisplayName (displayName: string): string {
  const nf = displayName.normalize('NFKD')
  const noCombining = nf.replace(/\p{M}/gu, '')
  const lowered = noCombining.toLowerCase()
  const replaced = lowered
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  const capped = replaced.length > FA_PROJECT_SLUG_MAX_LEN
    ? replaced.slice(0, FA_PROJECT_SLUG_MAX_LEN).replace(/-+$/g, '')
    : replaced
  const base = capped.length > 0 ? capped : 'fantasia-project'
  const finalBase = base.replace(/^\.+/, '')
  const stem = path.parse(finalBase).name
  const withoutReserved = WIN_RESERVED.has(stem) ? `project-${stem}` : finalBase
  return withoutReserved
}
