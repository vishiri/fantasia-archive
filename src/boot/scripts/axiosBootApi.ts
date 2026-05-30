import type { App } from 'vue'
import type { AxiosInstance } from 'axios'

export function createRunAxiosBoot (deps: {
  axios: AxiosInstance
  createApi: () => AxiosInstance
}): {
    api: AxiosInstance
    runAxiosBoot: (args: { app: App }) => void
  } {
  const api = deps.createApi()

  const runAxiosBoot = ({ app }: { app: App }): void => {
    app.config.globalProperties.$axios = deps.axios
    app.config.globalProperties.$api = api
  }

  return {
    api,
    runAxiosBoot
  }
}
