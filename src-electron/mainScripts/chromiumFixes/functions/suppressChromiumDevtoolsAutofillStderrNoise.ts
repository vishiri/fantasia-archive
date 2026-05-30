export function createSuppressChromiumDevtoolsAutofillStderrNoise (deps: {
  shouldSuppressDevtoolsAutofillStderrChunk: (chunk: unknown) => boolean
  stderr: NodeJS.WriteStream
}): () => void {
  /**
   * Chrome DevTools CDP Autofill noise on stderr (harmless); see Electron issue 41614.
   */
  const suppressChromiumDevtoolsAutofillStderrNoise = (): void => {
    const orig = deps.stderr.write.bind(deps.stderr) as typeof deps.stderr.write

    deps.stderr.write = ((chunk: unknown, encodingOrCb?: unknown, cb?: unknown) => {
      let enc: string | undefined
      let callback: ((err?: Error | null) => void) | undefined
      if (typeof encodingOrCb === 'function') {
        callback = encodingOrCb as (err?: Error | null) => void
      } else if (typeof encodingOrCb === 'string') {
        enc = encodingOrCb
        callback = cb as ((err?: Error | null) => void) | undefined
      } else {
        callback = encodingOrCb as ((err?: Error | null) => void) | undefined
      }

      if (deps.shouldSuppressDevtoolsAutofillStderrChunk(chunk)) {
        callback?.()
        return true
      }

      const payload = chunk as string | Uint8Array
      if (enc !== undefined && callback !== undefined) {
        return orig(payload, enc as Parameters<typeof orig>[1], callback)
      }
      if (enc !== undefined) return orig(payload, enc as Parameters<typeof orig>[1])
      if (callback !== undefined) return orig(payload, callback)
      return orig(payload)
    }) as typeof deps.stderr.write
  }

  return suppressChromiumDevtoolsAutofillStderrNoise
}
