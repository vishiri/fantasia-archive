import { ipcMain } from 'electron'

let events = {}
const handlers = {}
export function on (channel, listener) {
  if (!events[channel]) events[channel] = []
  ipcMain.on(channel, listener)
  events[channel].push(listener)
}
export function once (channel, listener) {
  if (!events[channel]) events[channel] = []
  const listener2 = function (...args) {
    events[channel] = events[channel].filter((e) => e !== listener)
    ipcMain.removeListener(channel, listener)
    listener(...args)
  }
  ipcMain.once(channel, listener2)
  events[channel].push(listener2)
}
export function removeListener (channel, listener) {
  if (!events[channel]) events[channel] = []
  events[channel] = events[channel].filter((e) => e !== listener)
  ipcMain.removeListener(channel, listener)
}
export function handle (channel, listener) {
  if (!handlers[channel]) handlers[channel] = []
  ipcMain.handle(channel, listener)
  handlers[channel].push(listener)
}
export function handleOnce (channel, listener) {
  if (!handlers[channel]) handlers[channel] = []
  const listener2 = function (...args) {
    handlers[channel] = handlers[channel].filter((e) => e !== listener)
    ipcMain.removeListener(channel, listener)
    listener(...args)
  }
  ipcMain.handleOnce(channel, listener2)
  handlers[channel].push(listener2)
}
export function removeHandler (channel, listener) {
  if (!handlers[channel]) handlers[channel] = []
  handlers[channel] = handlers[channel].filter((e) => e !== listener)
  ipcMain.removeHandler(channel, listener)
}
export function removeAllListeners (channel) {
  if (!channel) events = {}
  else events[channel] = []
  ipcMain.removeAllListeners(channel)
}

export function emit (channel, reply, ...data) {
  if (typeof reply !== 'function') data = [reply].concat(data)
  const o = events[channel]
  if (!o) return
  const e = {
    processId: -1,
    frameId: -1,
    sender: null,
    senderFrame: null,
    ports: [],
    reply: function (channel, ...args) {
      if (typeof reply === 'function')reply(channel, ...args)
    }
  }
  for (const i of o) {
    i(e, ...data)
  }
}

export function emitHandler (channel, reply, ...data) {
  if (typeof reply !== 'function') throw new Error('Must define reply-function')
  const o = handlers[channel]
  if (!o) return
  const e = {
    processId: -1,
    frameId: -1,
    sender: null,
    senderFrame: null
  }
  for (const i of o) {
    reply(i(e, ...data))
  }
}
