import type { T_faExternalLinkGetBrowserWindow } from 'app/types/I_faExternalLinkBoot'

export const getBrowserWindowForFaExternalLinks: T_faExternalLinkGetBrowserWindow = () => {
  return (globalThis as unknown as { window?: Window }).window
}
