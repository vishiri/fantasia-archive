import { boot } from 'quasar/wrappers'

const handleMouseClicks = (event: MouseEvent) => {
  /**
   * Target of the click event
   */
  const clickTarget = event.target as HTMLAnchorElement

  if (clickTarget === null) { return }

  /**
   * Prepare the actual link target variable
   */
  let targetLink: HTMLAnchorElement|false = (clickTarget.tagName === 'a')
    ? clickTarget
    : false

  if (targetLink === false) {
    const parentLink: HTMLAnchorElement|null = clickTarget.closest('a')
    targetLink = (parentLink !== null)
      ? parentLink
      : false
  }

  if (targetLink === false) { return }

  /**
   * HREF link of the url
   */
  const linkURL = targetLink.href

  /**
   * Determines if the URL is extenal or not
   */
  const isExternal = window.faContentBridgeAPIs.faExternalLinksManager.checkIfExternal(linkURL)

  if (isExternal) {
    /**
     * If the URL is external, prevent default and open the URL via the electron API functionality
     */
    event.preventDefault()
    window.faContentBridgeAPIs.faExternalLinksManager.openExternal(linkURL)
  }

  if (event.type === 'auxclick') {
    event.preventDefault()

    if (!isExternal) {
      window.location.href = linkURL
    }
  }
}

export default boot(() => {
  document.addEventListener('click', handleMouseClicks)

  document.addEventListener('auxclick', handleMouseClicks)
})
