import { shell } from 'electron'

import { I_faExternalLinksManagerAPI } from 'app/types/I_faExternalLinksManagerAPI'

export const faExternalLinksManagerAPI: I_faExternalLinksManagerAPI = {

  // Check if the URL is external
  checkIfExternal (url: string) {
    return (
      (url.includes('http://') || url.includes('https://')) &&
      !url.includes('localhost')
    )
  },

  // Open the external URL in the default browser of the user
  openExternal (url: string) {
    shell.openExternal(url)
  }

}
