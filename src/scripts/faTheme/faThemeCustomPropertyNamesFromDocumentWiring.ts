import { Result } from 'neverthrow'

import { createFaThemeFromThrowableAdapter } from './functions/createFaThemeFromThrowableAdapter'

export const faThemeFromThrowable = createFaThemeFromThrowableAdapter({
  fromThrowable: Result.fromThrowable as Parameters<typeof createFaThemeFromThrowableAdapter>[0]['fromThrowable']
})

export const getFaThemeDocumentStyleSheets = (): CSSStyleSheet[] => {
  if (typeof document === 'undefined') {
    return []
  }

  return Array.from(document.styleSheets)
}
