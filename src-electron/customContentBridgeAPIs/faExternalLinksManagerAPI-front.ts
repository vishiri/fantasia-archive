import { I_faExternalLinksManagerAPI } from 'app/interfaces/I_faExternalLinksManagerAPI.ts'
import { shell } from "app/electron-polyfill/shell";

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
