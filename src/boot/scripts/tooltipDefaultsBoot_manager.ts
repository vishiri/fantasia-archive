import { QTooltip } from 'quasar'

import { FA_Q_TOOLTIP_DELAY_MS } from 'app/src/scripts/appGlobalManagementUI/faQTooltipDelay_manager'

import { createRunTooltipDefaultsBoot } from './functions/createRunTooltipDefaultsBoot'

export const runTooltipDefaultsBoot = createRunTooltipDefaultsBoot({
  QTooltip: QTooltip as unknown as {
    props: {
      delay: {
        default: number
      }
    }
  },
  faQTooltipDelayMs: FA_Q_TOOLTIP_DELAY_MS
})
