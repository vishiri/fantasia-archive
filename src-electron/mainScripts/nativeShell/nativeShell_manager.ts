import { Menu } from 'electron'
import os from 'os'

import { createNativeShellTweaksApi } from './functions/nativeShellTweaks'

const nativeShellTweaksApi = createNativeShellTweaksApi({
  getPlatform: () => process.platform,
  osPlatform: () => os.platform(),
  setApplicationMenu: (menu: null) => {
    Menu.setApplicationMenu(menu)
  }
})

export const tweakRetriveOS = nativeShellTweaksApi.tweakRetriveOS

export const tweakMenuRemover = nativeShellTweaksApi.tweakMenuRemover
