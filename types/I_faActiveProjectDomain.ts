/**
 * Renderer session state for which Fantasia Archive project database is currently open.
 * Expand this shape when IPC, SQLite paths, or metadata are wired in.
 */
export interface I_faActiveProject {
  /**
   * Absolute path to the loaded '.faproject' SQLite file on disk.
   */
  filePath: string

  /**
   * Stable identifier for this open project (for example a session id from main).
   */
  id: string

  /**
   * User-facing title shown in chrome or menus for the loaded project.
   */
  name: string
}
