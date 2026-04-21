import { suppressChromiumDevtoolsAutofillStderrNoise } from 'app/src-electron/mainScripts/chromiumFixes/suppressChromiumDevtoolsAutofillStderrNoise'

suppressChromiumDevtoolsAutofillStderrNoise()

import { fixAppName } from 'app/src-electron/mainScripts/appIdentity/fixAppName'
import { windowsDevToolsExtensionsFix } from 'app/src-electron/mainScripts/chromiumFixes/windowsDevToolsExtensionsFix'
import { startApp, openAppWindowManager, closeAppManager } from 'app/src-electron/mainScripts/appManagement'
import { setupFaAppProtocol } from 'app/src-electron/mainScripts/appProtocol/registerFaAppProtocol'
import { tweakMenuRemover, tweakRetriveOS } from 'app/src-electron/mainScripts/nativeShell/tweaks'

// Determines what platform the app is running on
// - Needed in case process is undefined under Linux (Linux bug?)
const platform = tweakRetriveOS()

// Fix app name and connected pathing to it
fixAppName()

// Fix Windows-only DevTools-bug concerning dark mode
windowsDevToolsExtensionsFix(platform)

// Privileged 'app://' scheme registration must happen before 'app.whenReady()' so the handler installed below works for the first BrowserWindow load. The handler itself is wired post-ready.
setupFaAppProtocol()

// Register all ipcMain handlers before any BrowserWindow loads; preload uses invoke for bridge APIs after load.
startApp()

// Remove normal app menu
tweakMenuRemover()

// Set up manager for opening a singular app window
openAppWindowManager()

// Set up manager for closing app instance
closeAppManager(platform)

/*
--------------------------------------------
*/

/*
DB TESTING MANAGEMENT
TODO: ADJUST THIS WHEN SETTING UP `better-sqlite3`
*/
