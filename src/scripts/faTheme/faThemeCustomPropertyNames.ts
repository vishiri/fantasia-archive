import faThemeFromVite from 'app/src/css/fa-theme.scss?raw'

import { collectFaColorCustomPropertyNamesFromDocument } from 'app/src/scripts/faTheme/faThemeCustomPropertyNamesFromDocument'

/**
 * Picks up **`--fa-color-*`** names the browser has already parsed from theme CSS (HMR and
 * production bundles). Falls back to parsing the committed `fa-theme.scss` `?raw` string when the
 * document has no such rules (Node tests, pre-style paint).
 */
export function getFaColorCustomPropertyNamesForHelpPanel (): readonly string[] {
  const fromScss = parseFaColorCustomPropertyNamesFromThemeScss(faThemeFromVite)
  if (typeof document === 'undefined') {
    return Object.freeze([...fromScss]) as readonly string[]
  }
  const fromDom = collectFaColorCustomPropertyNamesFromDocument()
  if (fromDom.length > 0) {
    return Object.freeze([...fromDom]) as readonly string[]
  }
  return Object.freeze([...fromScss]) as readonly string[]
}

/**
 * Extracts **`--fa-color-*`** names declared under `:root` in `fa-theme.scss`. Values are not
 * included. Used as a fallback for the Custom program CSS help list when a DOM walk finds no
 * matching rules yet.
 */
export function parseFaColorCustomPropertyNamesFromThemeScss (source: string): string[] {
  const found = new Set<string>()
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('/*') || trimmed.startsWith('//') || trimmed.startsWith('@') || trimmed === '}' || trimmed === ':root {') {
      continue
    }
    const match = trimmed.match(/^(--fa-color-[a-z0-9]+(?:-[a-z0-9]+)*)\s*:/i)
    if (match) {
      found.add(match[1])
    }
  }
  return Array.from(found).sort()
}
