import { Buffer } from 'node:buffer'

import { expect, test, vi } from 'vitest'

import { suppressChromiumDevtoolsAutofillStderrNoise } from '../suppressChromiumDevtoolsAutofillStderrNoise'

/**
 * suppressChromiumDevtoolsAutofillStderrNoise
 * Swallows Chromium Autofill CDP noise lines so they never reach the prior stderr writer.
 */
test('Test that suppressChromiumDevtoolsAutofillStderrNoise filters Autofill stderr noise and forwards other lines', () => {
  const realWrite = process.stderr.write.bind(process.stderr)
  const forwarded: unknown[] = []

  process.stderr.write = ((chunk: unknown, encodingOrCb?: unknown, cb?: unknown) => {
    forwarded.push(chunk)
    if (typeof encodingOrCb === 'function') {
      encodingOrCb()
    } else if (typeof cb === 'function') {
      cb()
    }
    return true
  }) as typeof process.stderr.write

  try {
    suppressChromiumDevtoolsAutofillStderrNoise()

    const ret = process.stderr.write(
      "Autofill.enable wasn't found",
      () => {}
    )
    expect(ret).toBe(true)
    expect(forwarded).toHaveLength(0)

    forwarded.length = 0
    process.stderr.write('regular stderr line\n')
    expect(forwarded.length).toBe(1)
  } finally {
    process.stderr.write = realWrite
  }
})

/**
 * suppressChromiumDevtoolsAutofillStderrNoise
 * Matches Autofill noise when stderr chunk is a Buffer.
 */
test('Test that suppressChromiumDevtoolsAutofillStderrNoise filters Buffer chunks matching the Autofill pattern', () => {
  const realWrite = process.stderr.write.bind(process.stderr)
  const forwarded: unknown[] = []

  process.stderr.write = ((chunk: unknown, encodingOrCb?: unknown, cb?: unknown) => {
    forwarded.push(chunk)
    if (typeof encodingOrCb === 'function') {
      encodingOrCb()
    } else if (typeof cb === 'function') {
      cb()
    }
    return true
  }) as typeof process.stderr.write

  try {
    suppressChromiumDevtoolsAutofillStderrNoise()

    const noise = Buffer.from("Autofill.setAddresses wasn't found\n", 'utf8')
    process.stderr.write(noise, () => {})
    expect(forwarded).toHaveLength(0)
  } finally {
    process.stderr.write = realWrite
  }
})

/**
 * suppressChromiumDevtoolsAutofillStderrNoise
 * Forwards non-matching writes that pass encoding plus callback to the original stderr writer.
 */
test('Test that suppressChromiumDevtoolsAutofillStderrNoise forwards payload with encoding and callback when not filtered', () => {
  const realWrite = process.stderr.write.bind(process.stderr)
  const forwarded: Array<{
    args: unknown[]
  }> = []

  process.stderr.write = ((chunk: unknown, encodingOrCb?: unknown, cb?: unknown) => {
    forwarded.push({
      args: [chunk, encodingOrCb, cb]
    })
    if (typeof encodingOrCb === 'function') {
      encodingOrCb()
    } else if (typeof cb === 'function') {
      cb()
    }
    return true
  }) as typeof process.stderr.write

  try {
    suppressChromiumDevtoolsAutofillStderrNoise()

    const cb = vi.fn()
    process.stderr.write('keep me', 'utf8', cb)
    expect(forwarded.length).toBe(1)
    expect(forwarded[0]?.args[0]).toBe('keep me')
    expect(forwarded[0]?.args[1]).toBe('utf8')
    expect(forwarded[0]?.args[2]).toBe(cb)
  } finally {
    process.stderr.write = realWrite
  }
})

/**
 * suppressChromiumDevtoolsAutofillStderrNoise
 * asString falls back to String() for chunks that are neither string nor Buffer.
 */
test('Test that suppressChromiumDevtoolsAutofillStderrNoise forwards numeric chunks through the filter', () => {
  const realWrite = process.stderr.write.bind(process.stderr)
  const forwarded: unknown[] = []

  process.stderr.write = ((chunk: unknown, encodingOrCb?: unknown, cb?: unknown) => {
    forwarded.push(chunk)
    if (typeof encodingOrCb === 'function') {
      encodingOrCb()
    } else if (typeof cb === 'function') {
      cb()
    }
    return true
  }) as typeof process.stderr.write

  try {
    suppressChromiumDevtoolsAutofillStderrNoise()

    process.stderr.write(404 as unknown as string, () => {})
    expect(forwarded).toEqual([404])
  } finally {
    process.stderr.write = realWrite
  }
})

/**
 * suppressChromiumDevtoolsAutofillStderrNoise
 * Two-argument write(chunk, callback) forwards through the callback-only orig branch.
 */
test('Test that suppressChromiumDevtoolsAutofillStderrNoise forwards write with callback but no encoding', () => {
  const realWrite = process.stderr.write.bind(process.stderr)
  const forwarded: unknown[] = []

  process.stderr.write = ((chunk: unknown, encodingOrCb?: unknown, cb?: unknown) => {
    forwarded.push(chunk, encodingOrCb, cb)
    if (typeof encodingOrCb === 'function') {
      encodingOrCb()
    } else if (typeof cb === 'function') {
      cb()
    }
    return true
  }) as typeof process.stderr.write

  try {
    suppressChromiumDevtoolsAutofillStderrNoise()

    const cb = vi.fn()
    process.stderr.write('payload-only-callback', cb)
    expect(forwarded[0]).toBe('payload-only-callback')
    expect(forwarded[1]).toBe(cb)
    expect(forwarded[2]).toBeUndefined()
  } finally {
    process.stderr.write = realWrite
  }
})

/**
 * suppressChromiumDevtoolsAutofillStderrNoise
 * write(chunk, encoding) without a callback uses the encoding-only orig branch.
 */
test('Test that suppressChromiumDevtoolsAutofillStderrNoise forwards encoding without callback', () => {
  const realWrite = process.stderr.write.bind(process.stderr)
  const forwarded: unknown[] = []

  process.stderr.write = ((chunk: unknown, encodingOrCb?: unknown, cb?: unknown) => {
    forwarded.push(chunk, encodingOrCb, cb)
    return true
  }) as typeof process.stderr.write

  try {
    suppressChromiumDevtoolsAutofillStderrNoise()

    process.stderr.write('enc-only', 'utf8')
    expect(forwarded[0]).toBe('enc-only')
    expect(forwarded[1]).toBe('utf8')
    expect(forwarded[2]).toBeUndefined()
  } finally {
    process.stderr.write = realWrite
  }
})

/**
 * suppressChromiumDevtoolsAutofillStderrNoise
 * Single-argument write(chunk) uses the plain orig(payload) return path.
 */
test('Test that suppressChromiumDevtoolsAutofillStderrNoise forwards single-argument writes', () => {
  const realWrite = process.stderr.write.bind(process.stderr)
  const forwarded: unknown[] = []

  process.stderr.write = ((chunk: unknown, encodingOrCb?: unknown, cb?: unknown) => {
    forwarded.push(chunk, encodingOrCb, cb)
    return true
  }) as typeof process.stderr.write

  try {
    suppressChromiumDevtoolsAutofillStderrNoise()

    process.stderr.write('single-arg-line\n')
    expect(forwarded[0]).toBe('single-arg-line\n')
    expect(forwarded[1]).toBeUndefined()
    expect(forwarded[2]).toBeUndefined()
  } finally {
    process.stderr.write = realWrite
  }
})
