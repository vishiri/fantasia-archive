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
 * Open action monitor: default is **primary** + **F11** in `FA_KEYBIND_COMMAND_DEFINITIONS`.
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

/**
 * Default **Toggle Project Noteboard** chord: literal **Ctrl+Alt+D** stored as **ctrl+alt**
 * modifiers (matches 'FA_KEYBIND_COMMAND_DEFINITIONS' for 'toggleProjectNoteboard').
 * Playwright sends that combination on Windows, Linux, and macOS the same way.
 */
export const FA_PLAYWRIGHT_PRESS_DEFAULT_TOGGLE_PROJECT_NOTEBOARD = 'Control+Alt+D' as const

/**
 * Default **Show Project Dashboard** chord: literal **Ctrl+Shift+Alt+O** (see
 * 'FA_KEYBIND_COMMAND_DEFINITIONS' for 'showProjectDashboard').
 */
export const FA_PLAYWRIGHT_PRESS_DEFAULT_SHOW_PROJECT_DASHBOARD = 'Control+Alt+Shift+O' as const

/**
 * Default **Edit current document** chord: **primary** + **E**.
 */
export function getFaPlaywrightDefaultEditDocumentPressString (
  platform: NodeJS.Platform = process.platform
): string {
  return platform === 'darwin' ? 'Meta+E' : 'Control+E'
}

/**
 * Default **Save document without exiting edit mode** chord: **primary** + **S**.
 */
export function getFaPlaywrightDefaultSaveDocumentKeepEditModePressString (
  platform: NodeJS.Platform = process.platform
): string {
  return platform === 'darwin' ? 'Meta+S' : 'Control+S'
}

/**
 * Default **Save current document** chord: literal **Ctrl+Alt+S**.
 */
export const FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT = 'Control+Alt+S' as const

/**
 * Default **Previous document tab** chord: **Alt+Left**.
 */
export const FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_PREVIOUS_DOCUMENT_TAB = 'Alt+ArrowLeft' as const

/**
 * Default **Next document tab** chord: **Alt+Right**.
 */
export const FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_NEXT_DOCUMENT_TAB = 'Alt+ArrowRight' as const

/**
 * Default **Move document tab left** chord: **Alt+Shift+Left**.
 */
export const FA_PLAYWRIGHT_PRESS_DEFAULT_MOVE_DOCUMENT_TAB_LEFT = 'Alt+Shift+ArrowLeft' as const

/**
 * Default **Move document tab right** chord: **Alt+Shift+Right**.
 */
export const FA_PLAYWRIGHT_PRESS_DEFAULT_MOVE_DOCUMENT_TAB_RIGHT = 'Alt+Shift+ArrowRight' as const
