import { app } from 'electron'
import path from 'path'
import packageJSON from '../../package.json' assert {type: 'json'}

/**
 * Determines if the app name will have "-dev" affix at the end for the appData.
 */
export const determineAppName = () => {
  if (process.env.DEBUGGING) {
    return `${packageJSON.name}-dev`
  }

  return packageJSON.name
}

/**
 * Fix the name and pathing of the app.
 * - This function exists mostly due to dev-mode returning "Electron" instead of the app name.
 */
export const fixAppName = () => {
  const appName = determineAppName()
  if (appName) {
    app.setName(appName)
    const appData = app.getPath('appData')
    app.setPath('userData', path.join(appData, appName))
  }
}
