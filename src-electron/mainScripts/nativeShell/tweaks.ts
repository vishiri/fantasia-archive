import { Menu } from 'electron'
import os from 'os'

/**
  * Gets the current OS string-indetifier
  */
export const tweakRetriveOS = () => {
  return process.platform || os.platform()
}

/**
  * Removes the default menu from all current and future windows the current app
  */
export const tweakMenuRemover = () => {
  Menu.setApplicationMenu(null)
}
