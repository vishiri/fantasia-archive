export interface I_faExternalLinksManagerAPI {

  /**
   * Check the type of link input
   * true - Is external
   * false - is not external
   */
  checkIfExternal: (url: string) => boolean

  /**
   * Open external link in the default browser of the user
   */
  openExternal: (url: string) => void

}
