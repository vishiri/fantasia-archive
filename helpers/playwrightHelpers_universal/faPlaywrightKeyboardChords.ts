/**
 * {@link https://playwright.dev/docs/api/class-keyboard#keyboard-press} strings shared by
 * **Electron** E2E and component Playwright specs.
 *
 * **Primary modifier** (Toggle developer tools **F12**, Action Monitor **F11**):
 * the app’s defaults use the **primary** token, which `faKeybindExpandDefaultChord` maps to
 * **Meta** on **darwin** and **Ctrl** on **win32** / **linux** — match that when driving the
 * real global shortcut from Playwright.
 *
 * **Literal Control** in captured chords: overrides store **ctrl** in the keybind model, not
 * **primary**; the macOS **Control** key (not **Command**) must be used so Playwright
 * `keyboard.press` matches the same `keydown` the capture UI would record. Therefore
 * **Control+Shift+F12** (and similar) is the same string on every host OS.
 */
export function getFaPlaywrightDefaultToggleDevtoolsPressString (
  platform: NodeJS.Platform = process.platform
): string {
  return platform === 'darwin' ? 'Meta+F12' : 'Control+F12'
}

/**
 * Open Action Monitor: default is **primary** + **F11** in `FA_KEYBIND_COMMAND_DEFINITIONS`.
 */
export function getFaPlaywrightDefaultActionMonitorOpenPressString (
  platform: NodeJS.Platform = process.platform
): string {
  return platform === 'darwin' ? 'Meta+F11' : 'Control+F11'
}

/**
 * **Monaco** `select all` in Chromium: **Command+A** on macOS, **Control+A** on Windows and
 * Linux, matching the usual editor “mod” behavior.
 */
export function getFaPlaywrightMonacoSelectAllPressString (
  platform: NodeJS.Platform = process.platform
): string {
  return platform === 'darwin' ? 'Meta+A' : 'Control+A'
}

/**
 * Keybind capture + global dispatch for a user override that used the **Control** key for
 * Toggle developer tools. Same Playwright string on all platforms (see module JSDoc).
 */
export const FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12 = 'Control+Shift+F12' as const

/**
 * Keybind tests that capture **Control+Shift+F11** (not **primary** + **F12**).
 */
export const FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F11 = 'Control+Shift+F11' as const

/**
 * The **keybinds** E2E suite’s adjusted Toggle developer tools chord: explicit **Control** on
 * all platforms so the in-app modifier set stays **ctrl+alt+shift** after capture.
 */
export const FA_PLAYWRIGHT_PRESS_ADJUSTED_TOGGLE_DEVTOOLS_F12 = 'Control+Alt+Shift+F12' as const
