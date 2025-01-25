export interface I_faServerControlAPI {

  /**
   * Check the current visual sizing of the current window
   */
  setState: () => boolean,

  setRequestListener: (event: object) => void

}
