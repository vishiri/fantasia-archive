import { resolveVitePublicAssetPath } from 'app/src/scripts/appInternals/appInternals_manager'

import { createUseSplashControls } from './functions/createUseSplashControls'

export const useSplashControls = createUseSplashControls({
  resolveVitePublicAssetPath
})
