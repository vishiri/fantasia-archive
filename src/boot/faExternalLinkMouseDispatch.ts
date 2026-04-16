/**
 * Resolves the browser window used for bridge APIs and in-window navigation (tests inject a getter).
 */
export type T_faExternalLinkGetBrowserWindow = () => Window | undefined

function resolveAnchorFromMouseEvent (event: MouseEvent): HTMLAnchorElement | null {
  const clickTarget = event.target as HTMLAnchorElement

  if (clickTarget === null) {
    return null
  }

  let targetLink: HTMLAnchorElement | false = (clickTarget.tagName === 'a')
    ? clickTarget
    : false

  if (targetLink === false) {
    const parentLink: HTMLAnchorElement | null = clickTarget.closest('a')
    targetLink = (parentLink !== null)
      ? parentLink
      : false
  }

  if (targetLink === false) {
    return null
  }

  return targetLink
}

/**
 * Click and auxclick handler body for external link interception (shared by the Quasar boot file and Vitest).
 */
export function dispatchFaExternalLinkMouseEvent (
  event: MouseEvent,
  getBrowserWindow: T_faExternalLinkGetBrowserWindow
): void {
  const targetLink = resolveAnchorFromMouseEvent(event)
  if (targetLink === null) {
    return
  }

  const linkURL = targetLink.href

  const browserWindow = getBrowserWindow()
  const linksApi = browserWindow?.faContentBridgeAPIs?.faExternalLinksManager
  const managerOk =
    linksApi !== undefined &&
    typeof linksApi.checkIfExternal === 'function' &&
    typeof linksApi.openExternal === 'function'
  if (!managerOk) {
    return
  }

  /**
   * Determines if the URL is extenal or not
   */
  const isExternal = linksApi.checkIfExternal(linkURL)

  if (isExternal) {
    /**
     * If the URL is external, prevent default and open the URL via the electron API functionality
     */
    event.preventDefault()
    linksApi.openExternal(linkURL)
  }

  if (event.type === 'auxclick') {
    event.preventDefault()

    if (!isExternal && browserWindow !== undefined) {
      browserWindow.location.href = linkURL
    }
  }
}
