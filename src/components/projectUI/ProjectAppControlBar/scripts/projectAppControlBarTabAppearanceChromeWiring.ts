import type { CSSProperties } from 'vue'

import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { resolveFaDocumentAppearanceChromeStyle } from 'app/src/scripts/documentAppearance/documentAppearance_manager'
import { buildFaColorGlyphCssCustomProperties } from 'app/src/scripts/faColorContrast/faColorContrast_manager'

type T_projectAppControlBarTabAppearanceSource = Pick<
  I_faOpenedDocumentTab,
  'documentBackgroundColorDraft' | 'documentTextColorDraft'
> & {
  isMinorDraft?: boolean | undefined
}

/**
 * User-set document text color only — not minor muted grey.
 * Active tabs skip primary-bright override when this is true.
 */
export function resolveProjectAppControlBarTabHasUserCustomTextColor (
  tab: Pick<I_faOpenedDocumentTab, 'documentTextColorDraft'>
): boolean {
  return tab.documentTextColorDraft.trim().length > 0
}

/**
 * Minor document with no user text color — mute inactive chrome via CSS class.
 * Active tabs still use primary-bright (not customAppearance).
 */
export function resolveProjectAppControlBarTabShowsStatusMuted (
  tab: T_projectAppControlBarTabAppearanceSource
): boolean {
  return tab.isMinorDraft === true &&
    !resolveProjectAppControlBarTabHasUserCustomTextColor(tab)
}

/**
 * User appearance chrome only (background / text). Minor muted is class-driven.
 */
export function resolveProjectAppControlBarTabAppearanceChrome (
  tab: T_projectAppControlBarTabAppearanceSource
): I_faDocumentAppearanceChromeStyle | undefined {
  return resolveFaDocumentAppearanceChromeStyle({
    documentBackgroundColor: tab.documentBackgroundColorDraft,
    documentTextColor: tab.documentTextColorDraft
  })
}

export function resolveProjectAppControlBarTabInlineStyle (
  tab: T_projectAppControlBarTabAppearanceSource
): CSSProperties | undefined {
  const chrome = resolveProjectAppControlBarTabAppearanceChrome(tab)
  if (chrome === undefined) {
    return undefined
  }

  const style: Record<string, string> = {}
  const backgroundColor = chrome.backgroundColor
  const textColor = chrome.color

  if (backgroundColor !== undefined) {
    style['--projectAppControlBarTab-backgroundColor'] = backgroundColor
    style['--projectAppControlBarTab-focusHelperColor'] = backgroundColor
    style.backgroundColor = backgroundColor
  }
  if (textColor !== undefined) {
    style['--projectAppControlBarTab-textColor'] = textColor
    Object.assign(style, buildFaColorGlyphCssCustomProperties(textColor))
  }

  if (Object.keys(style).length === 0) {
    return undefined
  }

  return style
}
