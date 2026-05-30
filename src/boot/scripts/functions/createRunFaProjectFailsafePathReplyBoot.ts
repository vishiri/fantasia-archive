export function createRunFaProjectFailsafePathReplyBoot (deps: {
  getMode: () => string | undefined
  getActiveProjectFilePath: () => string | null
  installActiveProjectPathReply: (
    getPath: () => string | null
  ) => void
}): () => void {
  return function runFaProjectFailsafePathReplyBoot (): void {
    if (deps.getMode() !== 'electron') {
      return
    }

    deps.installActiveProjectPathReply(() => {
      return deps.getActiveProjectFilePath()
    })
  }
}
