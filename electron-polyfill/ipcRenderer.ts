
const ws = new WebSocket('ws://' + location.hostname + ':9301')
/*  cache = {},
  handler = {
    get (target, prop, receiver) {
      return function (...args) {
        ws.send(JSON.stringify(args))
        ws.addEventListener('message', (e) => { cache[prop] = e.data })
        return cache[prop]
      }
    }
  }
  */ 
const channels = {};
  
export const ipcRenderer = {
  send(channel,...args){
    ws.send("sender",channel+";"+JSON.string(args))
  },
  sendHandler(channel,...args){
    ws.send("handler;",channel+";"+JSON.string(args))
  },
  on (channel, listener) {
    if (!channels[channel]) channels[channel] = []
    channels[channel].push(listener)
  },
  once (channel, listener) {
    if (!channels[channel]) channels[channel] = []
    const listener2 = function (...args) {
      channels[channel] = channels[channel].filter((e) => e !== listener)
      listener(...args)
    }
    channels[channel].push(listener2)
  },
  off (channel, listener) {
    if (!channels[channel]) channels[channel] = []
    channels[channel] = channels[channel].filter((e) => e !== listener)
  }
};

ws.addEventListener('message', (e)=>{
  const channel = e.data.split(";").slice(1);
  const data = JSON.parse(e.data.split(";").slice(1).join(";"));
  const o = channels[channel]
  if (!o) return
  const ev = {
    sender: null,
    ports: [],
  }
  for (const i of o) {
    i(ev, ...data)
  }
});