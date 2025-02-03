import { fixAppName } from 'src-electron/mainScripts/fixAppName'
import { windowsDevToolsExtensionsFix } from 'src-electron/mainScripts/windowsDevToolsExtensionsFix'
import { startApp, openAppWindowManager, closeAppManager } from 'app/src-electron/mainScripts/appManagement'
import { tweakMenuRemover, tweakRetriveOS } from 'src-electron/mainScripts/tweaks'

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

/*
--------------------------------------------
*/

import * as sqlite3 from 'sqlite3'
import { app } from 'electron'
import fs from 'fs'

if (!fs.existsSync(`${app.getPath('userData')}/_faProjectTemp/`)) {
  fs.mkdirSync(`${app.getPath('userData')}/_faProjectTemp/`)
}

sqlite3.verbose()
const db = new sqlite3.Database(`${app.getPath('userData')}/_faProjectTemp/test.fae`)
/*
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS lorem (info TEXT, yeet TEXT)')

  const stmt = db.prepare('INSERT INTO lorem VALUES (?,?)')
  for (let i = 0; i < 10; i++) {
    stmt.run(['Ipsum ' + i, 'Yeet ' + (i + 10)])
  }

  stmt.finalize()

  db.each('SELECT rowid AS id, info, yeet FROM lorem', (_err, row: {id:string, info:string, yeet:string}) => {
    console.log(row.id + ': ' + row.info)
    console.log(row.id + ': ' + row.yeet)
  })
}) */

/* db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS sqlar (name TEXT, data BLOB)')

  const buffer = fs.readFileSync(`${app.getPath('userData')}/_faProjectTemp/testImg.jpg`)

  db.run('INSERT INTO sqlar VALUES (?, ?)', ['test', buffer])

  db.each('SELECT rowid AS id, name, data FROM sqlar', (_err, row: {id:string, name:string, data:string}) => {
    fs.writeFileSync(`${app.getPath('userData')}/_faProjectTemp/testImg2.jpg`, row.data)
  })
}) */

db.close()
