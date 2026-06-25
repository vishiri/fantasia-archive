import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

/**
 * App chrome menu models: top-level menu buttons, nested items, separators, and click triggers.
 */
export type T_menuItemMode = 'separator' | 'item'

export type T_menuItemTrigger = (...args: unknown[]) => unknown | void

/**
 * Session inputs for building Product menu trees (for example whether a project database is open).
 */
export interface I_appMenuBuildSession {
  /**
   * True when the app has a loaded project database for this session.
   */
  hasActiveProject: boolean

  recentProjects?: readonly I_faRecentProjectEntry[] | undefined
}

export interface I_appMenuSubItem {
  /**
   * Stable Vue list key for menu rendering.
   */
  itemKey?: string | undefined

  /**
   * Determines whether the item is a separator or a regular menu item.
   */
  mode: T_menuItemMode

  /**
   * Title of the submenu item.
   */
  text?: string | undefined

  /**
   * Icon/avatar of the submenu item.
   */
  icon?: string | undefined

  /**
   * Trigger function for the submenu item click.
   */
  trigger?: T_menuItemTrigger | undefined

  /**
   * Extra arguments for the trigger, if needed.
   */
  triggerArguments?: unknown[] | undefined

  /**
   * When false, the row is disabled. When true or unset, the row is enabled.
   */
  conditions?: boolean | undefined

  /**
   * Special color class for the submenu item.
   */
  specialColor?: string | undefined

  /**
   * When set, menu chrome may show the current global shortcut for this command (from `S_FaKeybinds`).
   */
  keybindCommandId?: T_faKeybindCommandId | undefined

  /**
   * Optional second line under the title using the same typography as shortcut hints (for example a file path).
   */
  secondaryHintText?: string | undefined
}

export interface I_appMenuItem {
  /**
   * Stable Vue list key for menu rendering.
   */
  itemKey?: string | undefined

  /**
   * Determines whether the item is a separator or a regular menu item.
   */
  mode: T_menuItemMode

  /**
   * Title of the menu item.
   */
  text?: string | undefined

  /**
   * Icon/avatar of the menu item.
   */
  icon?: string | undefined

  /**
   * Trigger function for the item click.
   */
  trigger?: T_menuItemTrigger | undefined

  /**
   * Extra arguments for the trigger, if needed.
   */
  triggerArguments?: unknown[] | undefined

  /**
   * When false, the row is disabled (Quasar `q-item` `disable`). When true or unset, the row is enabled.
   */
  conditions?: boolean | undefined

  /**
   * Special color class for the menu item.
   */
  specialColor?: string | undefined

  /**
   * Optional submenu items.
   */
  submenu?: I_appMenuSubItem[] | undefined

  /**
   * When set, menu chrome may show the current global shortcut for this command (from `S_FaKeybinds`).
   */
  keybindCommandId?: T_faKeybindCommandId | undefined

  /**
   * Optional second line under the title using the same typography as shortcut hints (for example a file path).
   */
  secondaryHintText?: string | undefined
}

export interface I_appMenuList {

  /**
   * Title of the main menu button
   */
  title: string

  /**
   * Data contents of the menu dropdown.
   */
  data: I_appMenuItem[]
}
