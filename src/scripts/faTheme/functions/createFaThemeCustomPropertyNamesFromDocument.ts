type T_fromThrowable = <T, E>(
  fn: () => T,
  errorFn: (error: unknown) => E
) => () => {
  isErr: () => boolean
  isOk: () => boolean
  value: T
}

function walkRuleList (
  list: CSSRuleList,
  found: Set<string>,
  fromThrowable: T_fromThrowable
): void {
  for (let i = 0; i < list.length; i++) {
    walkRule(list[i] as CSSRule | null | undefined, found, fromThrowable)
  }
}

function walkRule (
  rule: CSSRule | null | undefined,
  found: Set<string>,
  fromThrowable: T_fromThrowable
): void {
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
  const withNestedSheet = rule as { styleSheet?: CSSStyleSheet | null }
  if (withNestedSheet.styleSheet) {
    const nestedRules = fromThrowable(
      (): CSSRuleList => withNestedSheet.styleSheet!.cssRules,
      (): undefined => undefined
    )()
    if (nestedRules.isOk()) {
      walkRuleList(nestedRules.value, found, fromThrowable)
    }
    return
  }
  const withRules = rule as CSSRule & { cssRules?: CSSRuleList }
  const nestedListResult = fromThrowable(
    (): CSSRuleList | undefined | null => withRules.cssRules,
    (): undefined => undefined
  )()
  if (nestedListResult.isErr()) {
    return
  }
  const nestedList = nestedListResult.value
  if (nestedList) {
    walkRuleList(nestedList, found, fromThrowable)
  }
}

export function createFaThemeCustomPropertyNamesFromDocument (deps: {
  fromThrowable: T_fromThrowable
  getDocumentStyleSheets: () => CSSStyleSheet[]
}): {
    collectFaColorCustomPropertyNamesFromDocument: () => string[]
  } {
  const collectFaColorCustomPropertyNamesFromDocument = (): string[] => {
    const sheets = deps.getDocumentStyleSheets()
    if (sheets.length === 0) {
      return []
    }
    const found = new Set<string>()
    for (const sheet of sheets) {
      const sheetRulesResult = deps.fromThrowable(
        (): CSSRuleList => sheet.cssRules,
        (): undefined => undefined
      )()
      if (sheetRulesResult.isErr()) {
        continue
      }
      walkRuleList(sheetRulesResult.value, found, deps.fromThrowable)
    }
    return Array.from(found).sort()
  }

  return {
    collectFaColorCustomPropertyNamesFromDocument
  }
}
