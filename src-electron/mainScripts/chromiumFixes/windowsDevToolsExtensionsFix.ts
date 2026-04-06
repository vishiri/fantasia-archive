import { app, nativeTheme } from 'electron'
import path from 'path'
import fs from 'fs'
/**
  * DO NOT REMOVE THIS CODE! THERE IS NO PROPER FIX FOR THIS ISSUE!
  * This is a very hacky hot-fix solution of an issue where Electron hangs on launch if any DevTools extension are installed on Windows in Dark Mode.
  * @see https://github.com/electron/electron/issues/19468
  */
export const windowsDevToolsExtensionsFix = (platform: string) => {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    const devToolsExtensionsFolderExists = fs.existsSync(path.join(app.getPath('userData'), 'DevTools Extensions'))

    if (devToolsExtensionsFolderExists) {
      fs.unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
    }
  }
}
