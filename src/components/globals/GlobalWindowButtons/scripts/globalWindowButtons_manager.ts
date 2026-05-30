import { onMounted, onUnmounted, ref } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { createUseGlobalWindowButtons } from './functions/createUseGlobalWindowButtons'
import { globalWindowButtonsShouldPollMaximized } from './functions/globalWindowButtonsMaximizedPoll'

export const useGlobalWindowButtons = createUseGlobalWindowButtons({
  checkWindowMaximized: () => {
    return window.faContentBridgeAPIs!.faWindowControl.checkWindowMaximized()
  },
  clearInterval: (id) => window.clearInterval(id),
  getMode: () => process.env.MODE,
  hasFaWindowControlBridge: () => {
    return window.faContentBridgeAPIs?.faWindowControl !== undefined
  },
  onMounted,
  onUnmounted,
  ref,
  runFaAction,
  setInterval: (handler, ms) => window.setInterval(handler, ms),
  shouldPollMaximized: globalWindowButtonsShouldPollMaximized
})
