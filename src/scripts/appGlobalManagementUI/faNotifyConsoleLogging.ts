import type { Notify, QNotifyCreateOptions } from 'quasar'

let installDone = false

/**
 * Removes Fantasia-only notify options before handing the payload to Quasar.
 */
export function stripFaSkipFlagFromQuasarNotifyOpts (
  opts: QNotifyCreateOptions | string
): QNotifyCreateOptions | string {
  if (typeof opts === 'string') {
    return opts
  }
  if (opts.faSkipNotifyConsoleLog !== true) {
    return opts
  }
  const { faSkipNotifyConsoleLog: _omit, ...rest } = opts
  return rest
}

/**
 * Whether the boot-time wrapper should emit a console line for this create() call.
 */
export function shouldMirrorFaNotifyToConsole (opts: QNotifyCreateOptions | string): boolean {
  if (typeof opts === 'string') {
    return true
  }
  return opts.faSkipNotifyConsoleLog !== true
}

/**
 * Resolves the console method that best matches the toast type or color.
 */
export function resolveFaNotifyConsoleLogFn (
  opts: QNotifyCreateOptions | string
): (...args: unknown[]) => void {
  if (typeof opts === 'string') {
    return console.log
  }
  const t = opts.type
  if (t === 'negative') {
    return console.error
  }
  if (t === 'warning') {
    return console.warn
  }
  if (t === 'info') {
    return console.info
  }
  if (t === 'positive' || t === 'ongoing') {
    return console.log
  }
  const c = opts.color
  if (c === 'negative') {
    return console.error
  }
  if (c === 'warning') {
    return console.warn
  }
  if (c === 'info') {
    return console.info
  }
  if (c === 'positive') {
    return console.log
  }
  return console.log
}

/**
 * Compact payload mirrored to the devtools console (avoid cloning the whole Quasar options object).
 */
export function buildFaNotifyConsoleMirrorPayload (
  opts: QNotifyCreateOptions | string
): {
    caption?: string
    color?: string
    message?: string
    timeout?: number
    type?: string
  } {
  if (typeof opts === 'string') {
    return {
      message: opts
    }
  }
  const payload: {
    caption?: string
    color?: string
    message?: string
    timeout?: number
    type?: string
  } = {}
  if (opts.message !== undefined) {
    payload.message = opts.message
  }
  if (opts.caption !== undefined) {
    payload.caption = opts.caption
  }
  if (opts.type !== undefined) {
    payload.type = opts.type
  }
  if (opts.color !== undefined) {
    payload.color = opts.color
  }
  if (opts.timeout !== undefined) {
    payload.timeout = opts.timeout
  }
  return payload
}

export function emitFaNotifyConsoleMirror (opts: QNotifyCreateOptions | string): void {
  const logFn = resolveFaNotifyConsoleLogFn(opts)
  const payload = buildFaNotifyConsoleMirrorPayload(opts)
  logFn('[Notify]', payload)
}

/**
 * Wraps Quasar Notify.create so every toast mirrors to the console with a matching log level.
 */
export function installFaNotifyConsoleLogging (notify: Notify): void {
  if (installDone) {
    return
  }
  installDone = true
  const originalCreate = notify.create.bind(notify)
  notify.create = (opts: QNotifyCreateOptions | string) => {
    if (shouldMirrorFaNotifyToConsole(opts)) {
      emitFaNotifyConsoleMirror(opts)
    }
    return originalCreate(stripFaSkipFlagFromQuasarNotifyOpts(opts))
  }
}
