import type { CSSProperties } from 'vue'

import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { resolveFaDocumentAppearanceChromeStyle } from 'app/src/scripts/documentAppearance/functions/faDocumentAppearanceChromeStyle'
import { resolveFaDocumentStatusLabelColor } from 'app/src/scripts/documentAppearance/functions/resolveFaDocumentStatusLabelColor'

export function resolveProjectDocumentControlBarTabAppearanceChrome (
  tab: Pick<I_faOpenedDocumentTab, 'documentBackgroundColorDraft' | 'documentTextColorDraft'> & {
    isMinorDraft?: boolean | undefined
  }
): I_faDocumentAppearanceChromeStyle | undefined {
  const baseChrome = resolveFaDocumentAppearanceChromeStyle({
    documentBackgroundColor: tab.documentBackgroundColorDraft,
    documentTextColor: tab.documentTextColorDraft
  })
  const statusLabelColor = resolveFaDocumentStatusLabelColor({
    documentTextColor: tab.documentTextColorDraft,
    isMinor: tab.isMinorDraft === true
  })
  if (baseChrome === undefined && statusLabelColor === undefined) {
    return undefined
  }
  return {
    ...baseChrome,
    color: baseChrome?.color ?? statusLabelColor
  }
}

export function resolveProjectDocumentControlBarTabInlineStyle (
  tab: Pick<I_faOpenedDocumentTab, 'documentBackgroundColorDraft' | 'documentTextColorDraft'> & {
    isMinorDraft?: boolean | undefined
  }
): CSSProperties | undefined {
  const chrome = resolveProjectDocumentControlBarTabAppearanceChrome(tab)
  if (chrome === undefined) {
    return undefined
  }

  const style: Record<string, string> = {}
  const backgroundColor = chrome.backgroundColor
  const textColor = chrome.color

  if (backgroundColor !== undefined) {
    style['--projectDocumentControlBarTab-backgroundColor'] = backgroundColor
    style['--projectDocumentControlBarTab-focusHelperColor'] = backgroundColor
    style.backgroundColor = backgroundColor
  }
  if (textColor !== undefined) {
    style['--projectDocumentControlBarTab-textColor'] = textColor
  }

  if (Object.keys(style).length === 0) {
    return undefined
  }

  return style
}
