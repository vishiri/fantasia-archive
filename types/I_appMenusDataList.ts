export interface I_appMenusDataList {

  /**
   * Title of the main menu button
   */
  title: string

  /**
   * Data contents of the menu dropdown
   */
  data:{
   /**
    * Determines if the item shows as a separator or full-fledged menu item
    */
    mode: 'separator' | 'item'

   /**
    * Title of the menu item
    */
    text?: string

   /**
    * Icon/Avatar of the menu item
    */
    icon?: string

   /**
    * Trigger functionality of the item on click
    */
    trigger?: ((...args: any[]) => unknown|void)

    /**
     * Extra arguments for the trigger if need be
     */
    triggerArguments?: unknown[]

   /**
    * Conditions to show the menu item as active
    */
    conditions?: boolean

   /**
    *Special color class for the item
    */
    specialColor?: string

   /**
    * Determined if the item contains a submenu and its inner data
    */
    submenu?: {
      mode: 'separator' | 'item'
      text?: string
      icon?: string
      trigger?: ((...args: any[]) => unknown|void)
      triggerArguments?: []
      conditions?: boolean
      specialColor?: string
    }[]

  }[]
}
