import { app, nativeTheme } from 'electron'
import fs from 'fs'
import path from 'path'

import { shouldSuppressDevtoolsAutofillStderrChunk } from './functions/devtoolsAutofillStderrPattern'
import { createSuppressChromiumDevtoolsAutofillStderrNoise } from './functions/suppressChromiumDevtoolsAutofillStderrNoise'
import { createWindowsDevToolsExtensionsFix } from './functions/windowsDevToolsExtensionsFix'

export const suppressChromiumDevtoolsAutofillStderrNoise =
  createSuppressChromiumDevtoolsAutofillStderrNoise({
    shouldSuppressDevtoolsAutofillStderrChunk,
    stderr: process.stderr
  })

export const windowsDevToolsExtensionsFix = createWindowsDevToolsExtensionsFix({
  devToolsExtensionsFolderExists: (userDataPath: string) => fs.existsSync(userDataPath),
  getNativeThemeShouldUseDarkColors: () => nativeTheme.shouldUseDarkColors,
  getUserDataPath: () => app.getPath('userData'),
  joinPath: path.join,
  unlinkDevToolsExtensionsFolder: (userDataPath: string) => {
    fs.unlinkSync(userDataPath)
  }
})
