/**
 * Storybook-only scenario switch for mocked content bridge behavior.
 */
export type T_contentBridgeScenario =
  | 'default'
  | 'windowMaximized'
  | 'externalLinkFailure'

/**
 * Storybook-only i18n mock scenario for long strings or markdown-heavy fixtures.
 */
export type T_i18nScenario = 'default' | 'longStrings' | 'markdownHeavy'

/**
 * One Storybook index entry as returned by the Storybook static index.json shape.
 */
export interface I_storybookEntry {
  id: string
  title: string
  name: string
  type: string
  tags?: string[]
}

/**
 * Parsed Storybook index.json root used by visual tests.
 */
export interface I_storybookIndex {
  entries: Record<string, I_storybookEntry>
}
