import type { Ref } from 'vue'

import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

/**
 * Optional initial frame from persisted storage; when visible becomes true, a usable rect is clamped
 * into the viewport instead of centering.
 */
export interface I_UseFaFloatingWindowFrameOptions {
  /**
   * 'noteboard' uses the upper z-index band (5900–5999) so the app note board stays above
   * other floating windows (5000–5899) while remaining below modal dialogs and menus (6000+).
   */
  floatingWindowZLayer?: 'noteboard' | 'standard'
  persistedFrame?: Ref<I_faFloatingWindowPersistedRect | null | undefined>
}
