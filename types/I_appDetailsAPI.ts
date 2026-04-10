export interface I_appDetailsAPI {

  /**
   * Version of the project as stated in package.json (from main process).
   */
  getProjectVersion: () => Promise<string>

}
