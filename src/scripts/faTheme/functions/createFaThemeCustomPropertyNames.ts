export function createFaThemeCustomPropertyNames (deps: {
  collectFaColorCustomPropertyNamesFromDocument: () => string[]
  faThemeFromVite: string
  hasDocument: () => boolean
}): {
    getFaColorCustomPropertyNamesForHelpPanel: () => readonly string[]
    parseFaColorCustomPropertyNamesFromThemeScss: (source: string) => string[]
  } {
  const parseFaColorCustomPropertyNamesFromThemeScss = (source: string): string[] => {
    const found = new Set<string>()
    for (const line of source.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (trimmed === '' || trimmed.startsWith('/*') || trimmed.startsWith('//') || trimmed.startsWith('@') || trimmed === '}' || trimmed === ':root {') {
        continue
      }
      const match = trimmed.match(/^(--fa-color-[a-z0-9]+(?:-[a-z0-9]+)*)\s*:/i)
      if (match) {
        found.add(match[1]!)
      }
    }
    return Array.from(found).sort()
  }

  const getFaColorCustomPropertyNamesForHelpPanel = (): readonly string[] => {
    const fromScss = parseFaColorCustomPropertyNamesFromThemeScss(deps.faThemeFromVite)
    if (!deps.hasDocument()) {
      return Object.freeze([...fromScss]) as readonly string[]
    }
    const fromDom = deps.collectFaColorCustomPropertyNamesFromDocument()
    if (fromDom.length > 0) {
      return Object.freeze([...fromDom]) as readonly string[]
    }
    return Object.freeze([...fromScss]) as readonly string[]
  }

  return {
    getFaColorCustomPropertyNamesForHelpPanel,
    parseFaColorCustomPropertyNamesFromThemeScss
  }
}
