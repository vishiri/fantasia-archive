import { describe, expect, test } from 'vitest'

import {
  dedupeFaProjectPathsLastWins,
  extractFaProjectPathsFromArgv,
  pickLastFaProjectPathForOsOpen,
  resolveOsOpenFaProjectPathFromArgv
} from '../faProjectOsOpenArgv'

describe('extractFaProjectPathsFromArgv', () => {
  test('returns empty for flag-only argv', () => {
    expect(extractFaProjectPathsFromArgv(['electron', '-r', 'foo'])).toEqual([])
  })

  test('accepts Windows absolute drive-letter path', () => {
    expect(
      extractFaProjectPathsFromArgv(['D:\\p\\x.faproject'])
    ).toEqual(['D:\\p\\x.faproject'])
  })

  test('accepts quoted Windows path', () => {
    expect(
      extractFaProjectPathsFromArgv(['"D:\\p\\y.faproject"'])
    ).toEqual(['D:\\p\\y.faproject'])
  })

  test('accepts single-quoted POSIX path', () => {
    expect(
      extractFaProjectPathsFromArgv(["'/home/me/single.faproject'"])
    ).toEqual(['/home/me/single.faproject'])
  })

  test('accepts POSIX absolute path', () => {
    expect(
      extractFaProjectPathsFromArgv(['/home/me/a.faproject'])
    ).toEqual(['/home/me/a.faproject'])
  })

  test('accepts UNC share path', () => {
    expect(
      extractFaProjectPathsFromArgv(['\\\\srv\\share\\b.faproject'])
    ).toEqual(['\\\\srv\\share\\b.faproject'])
  })

  test('skips http dev server URL', () => {
    expect(
      extractFaProjectPathsFromArgv([
        'http://localhost:8080/',
        'D:\\x\\z.faproject'
      ])
    ).toEqual(['D:\\x\\z.faproject'])
  })

  test('skips --flag and plain electron executable path', () => {
    expect(
      extractFaProjectPathsFromArgv([
        'C:\\app\\electron.exe',
        '--inspect',
        'D:\\proj\\a.faproject'
      ])
    ).toEqual(['D:\\proj\\a.faproject'])
  })

  test('skips electron-main bundle path', () => {
    expect(
      extractFaProjectPathsFromArgv([
        '/app/dist/electron-main.js',
        '/data/p.faproject'
      ])
    ).toEqual(['/data/p.faproject'])
  })

  test('rejects relative .faproject path', () => {
    expect(extractFaProjectPathsFromArgv(['rel\\a.faproject'])).toEqual([])
  })

  test('preserves order for multiple projects', () => {
    expect(
      extractFaProjectPathsFromArgv([
        '/a/first.faproject',
        '/b/second.faproject'
      ])
    ).toEqual(['/a/first.faproject', '/b/second.faproject'])
  })

  test('skips empty argv token', () => {
    expect(extractFaProjectPathsFromArgv(['', '  ', '/z/z.faproject'])).toEqual([
      '/z/z.faproject'
    ])
  })

  test('skips packaged app.asar path that is not a faproject', () => {
    expect(
      extractFaProjectPathsFromArgv([
        'C:\\Program Files\\FA\\resources\\app.asar',
        'C:\\data\\q.faproject'
      ])
    ).toEqual(['C:\\data\\q.faproject'])
  })
})

describe('dedupeFaProjectPathsLastWins', () => {
  test('keeps last occurrence when the same logical path repeats', () => {
    const out = dedupeFaProjectPathsLastWins([
      '/x/a.faproject',
      '/y/b.faproject',
      '/x/a.faproject'
    ])
    expect(out).toEqual(['/y/b.faproject', '/x/a.faproject'])
  })

  test('ignores undefined entries when deduping', () => {
    const out = dedupeFaProjectPathsLastWins([
      '/x/a.faproject',
      undefined as unknown as string,
      '/y/b.faproject'
    ])
    expect(out).toEqual(['/x/a.faproject', '/y/b.faproject'])
  })
})

describe('pickLastFaProjectPathForOsOpen', () => {
  test('returns null when empty', () => {
    expect(pickLastFaProjectPathForOsOpen([])).toBeNull()
  })

  test('returns last path', () => {
    expect(
      pickLastFaProjectPathForOsOpen(['/a/a.faproject', '/b/b.faproject'])
    ).toBe('/b/b.faproject')
  })

  test('returns null when last slot is undefined', () => {
    expect(
      pickLastFaProjectPathForOsOpen([
        '/a/a.faproject',
        undefined as unknown as string
      ])
    ).toBeNull()
  })
})

describe('resolveOsOpenFaProjectPathFromArgv', () => {
  test('returns last extracted faproject', () => {
    expect(
      resolveOsOpenFaProjectPathFromArgv([
        '-w',
        '/q/a.faproject',
        '/q/b.faproject'
      ])
    ).toBe('/q/b.faproject')
  })
})
