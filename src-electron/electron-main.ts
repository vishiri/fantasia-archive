import { suppressChromiumDevtoolsAutofillStderrNoise } from 'app/src-electron/mainScripts/suppressChromiumDevtoolsAutofillStderrNoise'

suppressChromiumDevtoolsAutofillStderrNoise()

import { fixAppName } from 'app/src-electron/mainScripts/fixAppName'
import { windowsDevToolsExtensionsFix } from 'app/src-electron/mainScripts/windowsDevToolsExtensionsFix'
import { startApp, openAppWindowManager, closeAppManager } from 'app/src-electron/mainScripts/appManagement'
import { tweakMenuRemover, tweakRetriveOS } from 'app/src-electron/mainScripts/tweaks'

// Determines what platform the app is running on
// - Needed in case process is undefined under Linux (Linux bug?)
const platform = tweakRetriveOS()

// Fix app name and connected pathing to it
fixAppName()

// Fix Windows-only DevTools-bug concerning dark mode
windowsDevToolsExtensionsFix(platform)

// Start a singular app instance
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
TODO: ADJUST THIS WHEN SETTING UP `sqlite3`
*/
