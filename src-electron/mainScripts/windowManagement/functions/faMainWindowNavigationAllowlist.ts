/**
 * True when main-window navigation to 'rawUrl' is allowed (packaged 'app:' origin, or DEV APP_URL origin).
 * Foreign http(s) are denied here so 'will-navigate' can open them via 'shell.openExternal' instead.
 */
export function isFaMainWindowNavigationAllowed (rawUrl: string): boolean {
  if (!URL.canParse(rawUrl)) {
    return false
  }

  const parsed = new URL(rawUrl)

  if (parsed.protocol === 'app:') {
    return true
  }

  if (!process.env.DEV || parsed.protocol !== 'http:') {
    return false
  }

  const devUrl = process.env.APP_URL
  if (devUrl === undefined || devUrl.length === 0 || !URL.canParse(devUrl)) {
    return false
  }

  return parsed.origin === new URL(devUrl).origin
}
