import type { AxiosInstance } from 'axios'

export interface I_componentCustomPropertiesAxios {
  $axios: AxiosInstance
  $api: AxiosInstance
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends I_componentCustomPropertiesAxios {}
}
