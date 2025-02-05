import { boot } from 'quasar/wrappers'

export default boot(() => {
  document.addEventListener('click', e => {
    /**
     * Target of the click event
     */
    const clickTarget = e.target as HTMLAnchorElement

    if (clickTarget) {
      /**
       * Closest anchor element
       * Selector might end up being empty if the anchor itself was clicked. If so, select it instead
       */
      let originLink: HTMLAnchorElement|null|false = clickTarget.closest('a')
      if (originLink === null) {
        originLink = (clickTarget.tagName === 'a') ? clickTarget : false
      }

      if (originLink) {
        /**
         * HREF link of the url
         */
        const linkURL = originLink.href

        /**
         * Determines if the URL is extenal or not
         */
        const isExternal = window.faContentBridgeAPIs.faExternalLinksManager.checkIfExternal(linkURL)

        if (isExternal) {
          /**
           * If the URL is external, prevent default and open the URL via the electron API functionality
           */
          e.preventDefault()
          window.faContentBridgeAPIs.faExternalLinksManager.openExternal(linkURL)
        }
      }
    }
  })
})
