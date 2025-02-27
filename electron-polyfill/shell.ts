const ipcRenderer = window.ipcRenderer


export const shell = {
  openExternal: function (url, options = {}) {
    ipcRenderer.send('shell.openExternal', url, options)
  },
  trashItem: function (path) {
    ipcRenderer.send('shell.trashItem', path)
  },
  openPath: function (path) {
    ipcRenderer.send('shell.openPath', path)
  },
  showItemInFolder: function (fullPath) {
    ipcRenderer.send('shell.showItemInFolder', fullPath)
  },
  readShortcutLink: function (shortcutPath) {
    ipcRenderer.send('shell.readShortcutLink', shortcutPath)
  },
  beep: function () {
    ipcRenderer.send('shell.beep')
  },
  writeShortcutLink: function (shortcutPath, operation, options) {
    ipcRenderer.send('shell.writeShortcutLink', shortcutPath, operation, options)
  }
}
