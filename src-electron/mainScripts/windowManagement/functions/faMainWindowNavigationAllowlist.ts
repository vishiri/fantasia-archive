/**
 * True when main-window navigation to 'rawUrl' is allowed (app packaged origin, https, or dev APP_URL).
 */
export function isFaMainWindowNavigationAllowed (rawUrl: string): boolean {
  let parsed: URL

  try {
    parsed = new URL(rawUrl)
  } catch {
    return false
  }

  if (parsed.protocol === 'app:') {
    return true
  }

  if (parsed.protocol === 'https:') {
    return true
  }

  if (process.env.DEV && parsed.protocol === 'http:') {
    const devUrl = process.env.APP_URL

    if (devUrl !== undefined && devUrl.length > 0) {
      try {
        const devOrigin = new URL(devUrl).origin

        if (parsed.origin === devOrigin) {
          return true
        }
      } catch {
        return false
      }
    }
  }

  return false
}
