import type { Ref } from 'vue'

import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

/**
 * Optional initial frame from persisted storage; when visible becomes true, a usable rect is clamped
 * into the viewport instead of centering.
 */
export interface I_UseFaFloatingWindowFrameOptions {
  /**
   * 'noteboard' anchors the floating frame in band 5900–5949 (app-wide sticky notes).
   * 'projectNoteboard' uses band 5950–5999 so it stacks visibly above those windows yet still beneath modal chrome (6000+).
   * 'standard' uses band 5000–5799 (for example app-wide Custom CSS).
   * 'projectStyling' uses band 5800–5899 above app-wide styling but below noteboards.
   */
  floatingWindowZLayer?: 'noteboard' | 'projectNoteboard' | 'projectStyling' | 'standard' | undefined
  persistedFrame?: Ref<I_faFloatingWindowPersistedRect | null | undefined>
}
