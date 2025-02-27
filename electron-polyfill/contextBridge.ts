declare global{
  interface Window { faWindowControlAPI: object; faDevToolsControlAPI: object; faExternalLinksManagerAPI: object; extraEnvVariablesAPI: object; }
}


export const contextBridge = {
  exposeInMainWorld (name, value) {
      window[name] = value
  }
}
