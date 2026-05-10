import { i18n } from 'app/i18n/externalFileLoader'
import L_appSettings from 'app/i18n/en-US/dialogs/L_appSettings'

/**
 * Strips staging 'TODO - ' style prefixes from app-setting titles for Storybook-only display.
 */
export function stripTodoPrefixFromAppSettingsOptionTitle (title: string): string {
  return title.replace(/^\s*TODO\s*-\s*/i, '').trim()
}

type T_appSettingsAppOptionBlock = {
  title: string
}

/**
 * Builds a deep-merge fragment for 'dialogs.appSettings.appOptions.*.title' with TODO prefixes removed.
 */
export function buildAppSettingsStorybookAppOptionsTitlePatch (): Record<string, { title: string }> {
  const appOpts = L_appSettings.appOptions as Record<string, T_appSettingsAppOptionBlock>
  const patch: Record<string, { title: string }> = {}

  for (const [key, block] of Object.entries(appOpts)) {
    patch[key] = {
      title: stripTodoPrefixFromAppSettingsOptionTitle(block.title)
    }
  }

  return patch
}

/**
 * Patches the shared 'externalFileLoader' locale so 'buildAppSettingsRenderTree' reads cleaned titles in Storybook.
 */
export function applyAppSettingsStorybookDisplayTitlesPatch (): void {
  const appOptionsPatch = buildAppSettingsStorybookAppOptionsTitlePatch()

  i18n.global.mergeLocaleMessage('en-US', {
    dialogs: {
      appSettings: {
        appOptions: appOptionsPatch
      }
    }
  })
}
