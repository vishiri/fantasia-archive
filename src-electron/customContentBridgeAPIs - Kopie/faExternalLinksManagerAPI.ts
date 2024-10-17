import { shell } from 'electron'

import { I_faExternalLinksManagerAPI } from 'app/interfaces/I_faExternalLinksManagerAPI'

export const faExternalLinksManagerAPI: I_faExternalLinksManagerAPI = {

  checkIfExternal (url: string) {
    return (
      (url.includes('http://') || url.includes('https://')) &&
      !url.includes('localhost')
    )
  },

  openExternal (url: string) {
    shell.openExternal(url)
  }

}
