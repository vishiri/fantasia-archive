import { beforeEach, expect, test, vi } from 'vitest'

import type { Notify } from 'quasar'

beforeEach(() => {
  vi.resetModules()
})

/**
 * stripFaSkipFlagFromQuasarNotifyOpts
 * Returns strings unchanged so shorthand Notify.create payloads stay valid.
 */
test('Test that stripFaSkipFlagFromQuasarNotifyOpts leaves string opts unchanged', async () => {
  const { stripFaSkipFlagFromQuasarNotifyOpts } = await import('../faNotifyConsoleLogging_manager')
  expect(stripFaSkipFlagFromQuasarNotifyOpts('hello')).toBe('hello')
})

/**
 * stripFaSkipFlagFromQuasarNotifyOpts
 * Drops the Fantasia skip flag before Quasar consumes the props object.
 */
test('Test that stripFaSkipFlagFromQuasarNotifyOpts removes faSkipNotifyConsoleLog', async () => {
  const { stripFaSkipFlagFromQuasarNotifyOpts } = await import('../faNotifyConsoleLogging_manager')
  const stripped = stripFaSkipFlagFromQuasarNotifyOpts({
    faSkipNotifyConsoleLog: true,
    message: 'x',
    type: 'info'
  })
  expect(stripped).toEqual({
    message: 'x',
    type: 'info'
  })
})

/**
 * stripFaSkipFlagFromQuasarNotifyOpts
 * Leaves objects untouched when the skip flag is absent or false.
 */
test('Test that stripFaSkipFlagFromQuasarNotifyOpts preserves opts without skip', async () => {
  const { stripFaSkipFlagFromQuasarNotifyOpts } = await import('../faNotifyConsoleLogging_manager')
  const opts = {
    message: 'ok',
    type: 'positive' as const
  }
  expect(stripFaSkipFlagFromQuasarNotifyOpts(opts)).toBe(opts)
})

/**
 * shouldMirrorFaNotifyToConsole
 * Always mirrors string shorthand notifications.
 */
test('Test that shouldMirrorFaNotifyToConsole accepts string opts', async () => {
  const { shouldMirrorFaNotifyToConsole } = await import('../faNotifyConsoleLogging_manager')
  expect(shouldMirrorFaNotifyToConsole('msg')).toBe(true)
})

/**
 * shouldMirrorFaNotifyToConsole
 * Skips the mirror line when callers already logged the same event.
 */
test('Test that shouldMirrorFaNotifyToConsole rejects faSkipNotifyConsoleLog true', async () => {
  const { shouldMirrorFaNotifyToConsole } = await import('../faNotifyConsoleLogging_manager')
  expect(
    shouldMirrorFaNotifyToConsole({
      faSkipNotifyConsoleLog: true,
      message: 'dual'
    })
  ).toBe(false)
})

/**
 * buildFaNotifyConsoleMirrorPayload
 * Maps string opts to a message field for the console mirror.
 */
test('Test that buildFaNotifyConsoleMirrorPayload wraps string opts', async () => {
  const { buildFaNotifyConsoleMirrorPayload } = await import('../faNotifyConsoleLogging_manager')
  expect(buildFaNotifyConsoleMirrorPayload('hint')).toEqual({
    message: 'hint'
  })
})

/**
 * buildFaNotifyConsoleMirrorPayload
 * Copies only toast fields helpful in devtools.
 */
test('Test that buildFaNotifyConsoleMirrorPayload copies known toast fields', async () => {
  const { buildFaNotifyConsoleMirrorPayload } = await import('../faNotifyConsoleLogging_manager')
  expect(
    buildFaNotifyConsoleMirrorPayload({
      caption: 'detail',
      color: 'warning',
      message: 'body',
      timeout: 2000,
      type: 'warning'
    })
  ).toEqual({
    caption: 'detail',
    color: 'warning',
    message: 'body',
    timeout: 2000,
    type: 'warning'
  })
})

/**
 * buildFaNotifyConsoleMirrorPayload
 * Skips mirrored keys when callers omit matching notify props.
 */
test('Test that buildFaNotifyConsoleMirrorPayload omits undefined optional toast fields', async () => {
  const { buildFaNotifyConsoleMirrorPayload } = await import('../faNotifyConsoleLogging_manager')
  expect(buildFaNotifyConsoleMirrorPayload({
    caption: 'cap'
  })).toEqual({
    caption: 'cap'
  })
  expect(buildFaNotifyConsoleMirrorPayload({
    color: 'info',
    message: 'body-without-type'
  })).toEqual({
    color: 'info',
    message: 'body-without-type'
  })
})

/**
 * resolveFaNotifyConsoleLogFn
 * Routes built-in toast types and common colors to matching console sinks.
 */
test('Test that resolveFaNotifyConsoleLogFn picks console methods per type', async () => {
  const { resolveFaNotifyConsoleLogFn } = await import('../faNotifyConsoleLogging_manager')
  expect(resolveFaNotifyConsoleLogFn('quick')).toBe(console.log)
  expect(resolveFaNotifyConsoleLogFn({
    message: '',
    type: 'negative'
  })).toBe(console.error)
  expect(resolveFaNotifyConsoleLogFn({
    message: '',
    type: 'warning'
  })).toBe(console.warn)
  expect(resolveFaNotifyConsoleLogFn({
    message: '',
    type: 'info'
  })).toBe(console.info)
  expect(resolveFaNotifyConsoleLogFn({
    message: '',
    type: 'positive'
  })).toBe(console.log)
  expect(resolveFaNotifyConsoleLogFn({
    message: '',
    type: 'ongoing'
  })).toBe(console.log)
})

/**
 * resolveFaNotifyConsoleLogFn
 * Falls back through color hints when type is omitted.
 */
test('Test that resolveFaNotifyConsoleLogFn maps color fallback when type is omitted', async () => {
  const { resolveFaNotifyConsoleLogFn } = await import('../faNotifyConsoleLogging_manager')
  expect(resolveFaNotifyConsoleLogFn({
    color: 'info',
    message: ''
  })).toBe(console.info)
  expect(resolveFaNotifyConsoleLogFn({
    color: 'negative',
    message: ''
  })).toBe(console.error)
  expect(resolveFaNotifyConsoleLogFn({
    color: 'warning',
    message: ''
  })).toBe(console.warn)
  expect(resolveFaNotifyConsoleLogFn({
    color: 'positive',
    message: ''
  })).toBe(console.log)
})

/**
 * resolveFaNotifyConsoleLogFn
 * Defaults unknown combinations to console.log like neutral toasts.
 */
test('Test that resolveFaNotifyConsoleLogFn defaults to console.log', async () => {
  const { resolveFaNotifyConsoleLogFn } = await import('../faNotifyConsoleLogging_manager')
  expect(resolveFaNotifyConsoleLogFn({
    message: '',
    type: 'customRegistered'
  })).toBe(console.log)
})

/**
 * emitFaNotifyConsoleMirror
 * Sends the notify payload through the resolved console sink.
 */
test('Test that emitFaNotifyConsoleMirror calls console.info for info typed toasts', async () => {
  const { emitFaNotifyConsoleMirror } = await import('../faNotifyConsoleLogging_manager')
  const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  emitFaNotifyConsoleMirror({
    caption: 'c',
    message: 'm',
    type: 'info'
  })
  expect(infoSpy).toHaveBeenCalledWith(
    '[Notify]',
    expect.objectContaining({
      caption: 'c',
      message: 'm',
      type: 'info'
    })
  )
  infoSpy.mockRestore()
})

/**
 * emitFaNotifyConsoleMirror
 */
test('Test that emitFaNotifyConsoleMirror calls console.error for negative toasts', async () => {
  const { emitFaNotifyConsoleMirror } = await import('../faNotifyConsoleLogging_manager')
  const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  emitFaNotifyConsoleMirror({
    message: 'bad',
    type: 'negative'
  })
  expect(errSpy).toHaveBeenCalledWith(
    '[Notify]',
    expect.objectContaining({
      message: 'bad',
      type: 'negative'
    })
  )
  errSpy.mockRestore()
})

/**
 * installFaNotifyConsoleLogging
 * Wraps Notify.create exactly once so repeated install calls are idempotent.
 */
test('Test that installFaNotifyConsoleLogging does not double-wrap Notify.create', async () => {
  const originalCreate = vi.fn(() => (): void => {})
  const notify = { create: originalCreate }
  const { installFaNotifyConsoleLogging } = await import('../faNotifyConsoleLogging_manager')
  installFaNotifyConsoleLogging(notify as unknown as Notify)
  const wrapped = notify.create
  installFaNotifyConsoleLogging(notify as unknown as Notify)
  expect(notify.create).toBe(wrapped)
})

/**
 * installFaNotifyConsoleLogging
 * Ignores later notify shells after Quasar installs the first global API.
 */
test('Test that installFaNotifyConsoleLogging does not mutate a second notify object', async () => {
  const inner1 = vi.fn(() => (): void => {})
  const inner2 = vi.fn(() => (): void => {})
  const n1 = {
    create: inner1
  }
  const n2 = {
    create: inner2
  }
  const { installFaNotifyConsoleLogging } = await import('../faNotifyConsoleLogging_manager')
  installFaNotifyConsoleLogging(n1 as unknown as Notify)
  installFaNotifyConsoleLogging(n2 as unknown as Notify)
  expect(n2.create).toBe(inner2)
})

/**
 * installFaNotifyConsoleLogging
 * Mirrors to console then forwards sanitized opts to Quasar.
 */
test('Test that installFaNotifyConsoleLogging logs then calls the original notify create', async () => {
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  const originalCreate = vi.fn(() => (): void => {})
  const notify = { create: originalCreate }
  const { installFaNotifyConsoleLogging } = await import('../faNotifyConsoleLogging_manager')
  installFaNotifyConsoleLogging(notify as unknown as Notify)
  const callCreate = notify.create as (opts: Parameters<Notify['create']>[0]) => ReturnType<Notify['create']>
  callCreate({
    message: 'toast',
    type: 'positive'
  })
  expect(logSpy).toHaveBeenCalledWith(
    '[Notify]',
    expect.objectContaining({
      message: 'toast',
      type: 'positive'
    })
  )
  expect(originalCreate).toHaveBeenCalledWith({
    message: 'toast',
    type: 'positive'
  })
  logSpy.mockRestore()
})

/**
 * installFaNotifyConsoleLogging
 * Skips the mirrored console row when callers pass faSkipNotifyConsoleLog true.
 */
test('Test that installFaNotifyConsoleLogging honors faSkipNotifyConsoleLog', async () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const originalCreate = vi.fn(() => (): void => {})
  const notify = { create: originalCreate }
  const { installFaNotifyConsoleLogging } = await import('../faNotifyConsoleLogging_manager')
  installFaNotifyConsoleLogging(notify as unknown as Notify)
  const callCreate = notify.create as (opts: Parameters<Notify['create']>[0]) => ReturnType<Notify['create']>
  callCreate({
    faSkipNotifyConsoleLog: true,
    message: 'hidden',
    type: 'warning'
  })
  expect(warnSpy).not.toHaveBeenCalled()
  expect(originalCreate).toHaveBeenCalledWith({
    message: 'hidden',
    type: 'warning'
  })
  warnSpy.mockRestore()
})
