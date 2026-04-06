/**
 * Chrome DevTools (bundled with Electron) calls CDP methods such as 'Autofill.enable' that Electron's debug target does not implement; Chromium logs those failures to stderr, which is harmless for app behavior.
 * @see https://github.com/electron/electron/issues/41614
 */
export function suppressChromiumDevtoolsAutofillStderrNoise (): void {
  const pattern = /Autofill\.(enable|setAddresses).*wasn't found/
  const stderr = process.stderr
  const orig = stderr.write.bind(stderr) as typeof stderr.write

  stderr.write = ((chunk: unknown, encodingOrCb?: unknown, cb?: unknown) => {
    const asString = (c: unknown): string =>
      typeof c === 'string' ? c : Buffer.isBuffer(c) ? c.toString('utf8') : String(c)

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

    if (pattern.test(asString(chunk))) {
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
  }) as typeof stderr.write
}
