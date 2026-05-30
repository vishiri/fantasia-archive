import type {
  I_faNotifyLike,
  T_faQNotifyCreateOptionsInput
} from 'app/types/I_faNotifyConsoleLogging'

let faNotifyConsoleLoggingInstallDone = false

function stripFaSkipFlagFromQuasarNotifyOpts (
  opts: T_faQNotifyCreateOptionsInput
): T_faQNotifyCreateOptionsInput {
  if (typeof opts === 'string') {
    return opts
  }
  if (opts.faSkipNotifyConsoleLog !== true) {
    return opts
  }
  const { faSkipNotifyConsoleLog: _omit, ...rest } = opts
  return rest
}

function shouldMirrorFaNotifyToConsole (opts: T_faQNotifyCreateOptionsInput): boolean {
  if (typeof opts === 'string') {
    return true
  }
  return opts.faSkipNotifyConsoleLog !== true
}

function resolveFaNotifyConsoleLogFn (
  opts: T_faQNotifyCreateOptionsInput
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

function buildFaNotifyConsoleMirrorPayload (
  opts: T_faQNotifyCreateOptionsInput
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

function emitFaNotifyConsoleMirror (opts: T_faQNotifyCreateOptionsInput): void {
  const logFn = resolveFaNotifyConsoleLogFn(opts)
  const payload = buildFaNotifyConsoleMirrorPayload(opts)
  logFn('[Notify]', payload)
}

function installFaNotifyConsoleLogging (notify: I_faNotifyLike): void {
  if (faNotifyConsoleLoggingInstallDone) {
    return
  }
  faNotifyConsoleLoggingInstallDone = true
  const originalCreate = notify.create.bind(notify)
  notify.create = (opts: T_faQNotifyCreateOptionsInput) => {
    if (shouldMirrorFaNotifyToConsole(opts)) {
      emitFaNotifyConsoleMirror(opts)
    }
    return originalCreate(stripFaSkipFlagFromQuasarNotifyOpts(opts))
  }
}

export function createFaNotifyConsoleLogging (): {
  buildFaNotifyConsoleMirrorPayload: typeof buildFaNotifyConsoleMirrorPayload
  emitFaNotifyConsoleMirror: typeof emitFaNotifyConsoleMirror
  installFaNotifyConsoleLogging: typeof installFaNotifyConsoleLogging
  resolveFaNotifyConsoleLogFn: typeof resolveFaNotifyConsoleLogFn
  shouldMirrorFaNotifyToConsole: typeof shouldMirrorFaNotifyToConsole
  stripFaSkipFlagFromQuasarNotifyOpts: typeof stripFaSkipFlagFromQuasarNotifyOpts
} {
  return {
    buildFaNotifyConsoleMirrorPayload,
    emitFaNotifyConsoleMirror,
    installFaNotifyConsoleLogging,
    resolveFaNotifyConsoleLogFn,
    shouldMirrorFaNotifyToConsole,
    stripFaSkipFlagFromQuasarNotifyOpts
  }
}
