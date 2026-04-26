/**
 * Collects **`--fa-color-*`** custom property names from in-document `CSSStyleRule` declarations.
 * Picks up Vite HMR `style` tags, linked bundles, and nested `@media` / `@layer` / `@import` rules.
 * Skips stylesheets that throw on `cssRules` (cross-origin) and any nested rule list that is not
 * accessible.
 */
export function collectFaColorCustomPropertyNamesFromDocument (): string[] {
  if (typeof document === 'undefined') {
    return []
  }
  const found = new Set<string>()
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    walkRuleList(rules, found)
  }
  return Array.from(found).sort()
}

function walkRuleList (list: CSSRuleList, found: Set<string>): void {
  for (let i = 0; i < list.length; i++) {
    walkRule(list[i] as CSSRule | null | undefined, found)
  }
}

function walkRule (rule: CSSRule | null | undefined, found: Set<string>): void {
  if (rule == null) {
    return
  }
  if (rule instanceof CSSStyleRule) {
    const style = rule.style
    for (let j = 0; j < style.length; j++) {
      const name = style.item(j)
      if (name && name.startsWith('--fa-color-')) {
        found.add(name)
      }
    }
    return
  }
  /**
   * `CSSImportRule` exposes a nested `styleSheet`; some test harnesses only provide a duck-typed
   * object with the same shape.
   */
  const withNestedSheet = rule as { styleSheet?: CSSStyleSheet | null }
  if (withNestedSheet.styleSheet) {
    try {
      const rules = withNestedSheet.styleSheet.cssRules
      walkRuleList(rules, found)
    } catch {
      // Ignore nested sheets that are not readable.
    }
    return
  }
  const withRules = rule as CSSRule & { cssRules?: CSSRuleList }
  try {
    const nested = withRules.cssRules
    if (nested) {
      walkRuleList(nested, found)
    }
  } catch {
    // Ignore nested at-rules the engine does not expose or getters that throw.
  }
}
