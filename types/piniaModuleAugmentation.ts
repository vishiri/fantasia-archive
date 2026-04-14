import type { Router } from 'vue-router'

/**
 * Store instance properties injected by Quasar/Pinia setup (for example router access in stores).
 */
export interface I_piniaCustomPropertiesRouter {
  readonly router: Router
}

declare module 'pinia' {
  export interface PiniaCustomProperties extends I_piniaCustomPropertiesRouter {}
}
