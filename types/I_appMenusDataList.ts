/**
 * App chrome menu models: top-level menu buttons, nested items, separators, and click triggers.
 */
export type T_menuItemMode = 'separator' | 'item'

export type T_menuItemTrigger = (...args: unknown[]) => unknown | void

export interface I_appMenuSubItem {
  /**
   * Determines whether the item is a separator or a regular menu item.
   */
  mode: T_menuItemMode

  /**
   * Title of the submenu item.
   */
  text?: string

  /**
   * Icon/avatar of the submenu item.
   */
  icon?: string

  /**
   * Trigger function for the submenu item click.
   */
  trigger?: T_menuItemTrigger

  /**
   * Extra arguments for the trigger, if needed.
   */
  triggerArguments?: unknown[]

  /**
   * Condition to show the submenu item as active.
   */
  conditions?: boolean

  /**
   * Special color class for the submenu item.
   */
  specialColor?: string
}

export interface I_appMenuItem {
  /**
   * Determines whether the item is a separator or a regular menu item.
   */
  mode: T_menuItemMode

  /**
   * Title of the menu item.
   */
  text?: string

  /**
   * Icon/avatar of the menu item.
   */
  icon?: string

  /**
   * Trigger function for the item click.
   */
  trigger?: T_menuItemTrigger

  /**
   * Extra arguments for the trigger, if needed.
   */
  triggerArguments?: unknown[]

  /**
   * Condition to show the menu item as active.
   */
  conditions?: boolean

  /**
   * Special color class for the menu item.
   */
  specialColor?: string

  /**
   * Optional submenu items.
   */
  submenu?: I_appMenuSubItem[]
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
