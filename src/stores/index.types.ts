import type { Router } from 'vue-router'

export interface I_piniaCustomPropertiesRouter {
  readonly router: Router
}

declare module 'pinia' {
  export interface PiniaCustomProperties extends I_piniaCustomPropertiesRouter {}
}
