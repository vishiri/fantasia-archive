/** Environment inputs for resolveFaPlaywrightIsolatedUserDataDir. */
export type T_faPlaywrightUserDataPathInput = {
  /** Subset of process.env; only APPDATA / XDG_CONFIG_HOME are read. */
  env: Record<string, string | undefined>
  homedir: string
  platform: NodeJS.Platform
}
