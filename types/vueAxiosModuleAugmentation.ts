import type { AxiosInstance } from 'axios'

/**
 * Options-API globals registered on the Vue app for Axios access.
 */
export interface I_componentCustomPropertiesAxios {
  $axios: AxiosInstance
  $api: AxiosInstance
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends I_componentCustomPropertiesAxios {}
}
