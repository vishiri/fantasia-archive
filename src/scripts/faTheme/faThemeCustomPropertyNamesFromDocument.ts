/**
 * Collects **`--fa-color-*`** custom property names from in-document `CSSStyleRule` declarations.
 * Picks up Vite HMR `style` tags, linked bundles, and nested `@media` / `@layer` / `@import` rules.
 * Skips stylesheets that throw on `cssRules` (cross-origin) and any nested rule list that is not
 * accessible.
 */
import { Result } from 'neverthrow'

export function collectFaColorCustomPropertyNamesFromDocument (): string[] {
  if (typeof document === 'undefined') {
    return []
  }
  const found = new Set<string>()
  for (const sheet of Array.from(document.styleSheets)) {
    const sheetRulesResult = Result.fromThrowable(
      (): CSSRuleList => sheet.cssRules,
      (): undefined => undefined
    )()
    if (sheetRulesResult.isErr()) {
      continue
    }
    walkRuleList(sheetRulesResult.value, found)
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
    const nestedRules = Result.fromThrowable(
      (): CSSRuleList => withNestedSheet.styleSheet!.cssRules,
      (): undefined => undefined
    )()
    if (nestedRules.isOk()) {
      walkRuleList(nestedRules.value, found)
    }
    return
  }
  const withRules = rule as CSSRule & { cssRules?: CSSRuleList }
  const nestedListResult = Result.fromThrowable(
    (): CSSRuleList | undefined | null => withRules.cssRules,
    (): undefined => undefined
  )()
  if (nestedListResult.isErr()) {
    return
  }
  const nestedList = nestedListResult.value
  if (nestedList) {
    walkRuleList(nestedList, found)
  }
}
