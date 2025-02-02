export interface I_extraEnvVariablesAPI {

  /**
   * Full path to "electron-main.js" file in the dist, unpackaged form
   */
  ELECTRON_MAIN_FILEPATH: string

  /**
   * Extra rended timer buffer for tests to start after loading the app.
   * - Increase if your machine isn't keeping up with the render times and tests are randomly failing.
   * - Lower if your machine is quick and the tests are waiting for no reason at all.
   * - Can be set manually for each component/e2e test inside the test file.
   */
  FA_FRONTEND_RENDER_TIMER: number

  /**
   * Type of test environment to load.
   * - 'components'
   * - 'e2e'
   */
  TEST_ENV?: string|false

  /**
   * Name of the component being tested.
   * - MUST match the file name of the vue file being tested (including the capital letter at the start).
   */
  COMPONENT_NAME?: string|false

  /**
   * Component props, assuming they have any.
   */
  COMPONENT_PROPS?: string|false

}
