import { i18n } from 'app/i18n/externalFileLoader'
import L_programSettings from 'app/i18n/en-US/dialogs/L_programSettings'

/**
 * Strips staging 'TODO - ' style prefixes from program-setting titles for Storybook-only display.
 */
export function stripTodoPrefixFromProgramSettingTitle (title: string): string {
  return title.replace(/^\s*TODO\s*-\s*/i, '').trim()
}

type T_programSettingsAppOptionBlock = {
  title: string
}

/**
 * Builds a deep-merge fragment for 'dialogs.programSettings.appOptions.*.title' with TODO prefixes removed.
 */
export function buildProgramSettingsStorybookAppOptionsTitlePatch (): Record<string, { title: string }> {
  const appOpts = L_programSettings.appOptions as Record<string, T_programSettingsAppOptionBlock>
  const patch: Record<string, { title: string }> = {}

  for (const [key, block] of Object.entries(appOpts)) {
    patch[key] = {
      title: stripTodoPrefixFromProgramSettingTitle(block.title)
    }
  }

  return patch
}

/**
 * Patches the shared 'externalFileLoader' locale so 'buildProgramSettingsRenderTree' reads cleaned titles in Storybook.
 */
export function applyProgramSettingsStorybookDisplayTitlesPatch (): void {
  const appOptionsPatch = buildProgramSettingsStorybookAppOptionsTitlePatch()

  i18n.global.mergeLocaleMessage('en-US', {
    dialogs: {
      programSettings: {
        appOptions: appOptionsPatch
      }
    }
  })
}
