import { I_faServerControlAPI } from 'app/interfaces/I_faServerControlAPI'
import { ipcRenderer } from 'electron'

let k = () => {
  // pass;
}

ipcRenderer.on('request', function (ev, ...args) { k({ args: args, sender: ev.sender, respond: (...args2) => ipcRenderer.send(args[0], ...args2) }, ...args.slice(1)) })

export const faServerControlAPI: I_faServerControlAPI = {

  setState (active) {
    return ipcRenderer.send('server', active)
  },
  setRequestListener (func) {
    k = func
  }
}
