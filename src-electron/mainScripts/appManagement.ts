import { initialize } from '@electron/remote/main'
import { mainWindowCreation } from 'app/src-electron/mainScripts/mainWindowCreation'
import { app } from 'electron'
import * as path from 'node:path'
import * as fs from 'node:fs'
import mime from 'mime'
import minimatch from 'minimatch'
import { WebSocketServer } from 'ws'
import * as ipc from 'app/src-electron/electron-ipc'

// Starts the app's Electron instance
export const startApp = () => {
  initialize()
}

const PORT = 8000

/**
  * Opens the singular app's window and make sure it is the only one
  */
export const openAppWindowManager = () => {
  // Create the app window in the normal way
  app.whenReady().then(() => mainWindowCreation())
  //
  // Ready the server #1
  app.whenReady().then(() => {
    const http = require('http')
    const crypto = require('crypto')
    //let webContents = null
    const server = http.createServer(function (req, res) {
      /*if (!req.url || req.url === '/') {
        const port = crypto.randomBytes(16).toString('hex')
        ipc.once(port, function (ev, body, status = 200, head = {}) {
          res.writeHead(status, head)
          res.end(body)
        })
        webContents.send('request', port)
      } else {*/
        const midfix = process.env.DEV ? '../../public' : ''
        const midfix2 = process.env.DEV ? '../../node_modules' : ''
        let Path = path.join(__dirname, midfix, req.url)
        if (!minimatch(Path, path.join(__dirname, midfix, '**'))) {
          res.writeHead(400, { 'error': 'to-high' })
          return res.end()
        }
        if (!fs.existsSync(Path) && minimatch(path.join(__dirname, midfix2, '..', req.url), path.join(__dirname, midfix2, '**'))) {
          Path = path.join(__dirname, midfix2, '..', req.url)
        }
        if (!fs.existsSync(Path)) {
          res.writeHead(400, { 'error': 'not avaible/existing' })
          return res.end()
        }
        res.writeHead(200, { 'Content-Length': fs.statSync(Path).size, 'Content-Type': mime.lookup(Path) })
        fs.createReadStream(Path).pipe(res)
      //}
    })
    const wws = new WebSocketServer({ noServer: true })
    server.on('upgrade', function upgrade (request, socket, head) {
      const { pathname } = new URL(request.url, 'wss://base.url')
      if (pathname === '/ws') {
        wws.handleUpgrade(request, socket, head, function done (ws) {
          wws.emit('connection', ws, request)
        })
      }
    })
    ipc.on('server', function (ev, state) {
      if (state === server.listening) return
      if (!state) {
        server.close()
      } else {
        //webContents = ev.sender
        console.log('http://localhost:' + PORT)
        server.listen(PORT)
      }
      return server.listening
    })
  })
  //
  // Ready the server #1
  app.whenReady().then(() => {
    const wws = new WebSocketServer({ port: 9301 })
    console.log('server #2 : 9301')
    wws.on('connection', function con (ws) {
      ws.on('message', function (data) {
        const t = data.split(';').slice(1).join(';')
        const channel = data.split(';')[1]
        const reply = (channel,...args)=>{ws.send(channel+";"+JSON.stringify(args))};
        if (data.split(';')[0] === 'handler')ipc.emitHandler(channel,reply,JSON.parse(t))
        else ipc.emit(channel,reply,JSON.parse(t))
      })
    })
  })

  // Create the app window, if it still doesn't exist yet
  app.on('activate', () => {
    mainWindowCreation()
  })
}

// Closes the app's Electron instance when all windows are closed
export const closeAppManager = (platform: string) => {
  // Close app if we are on anything that isn't Mac
  app.on('window-all-closed', () => {
    if (platform !== 'darwin') {
      app.quit()
    }
  })
}
