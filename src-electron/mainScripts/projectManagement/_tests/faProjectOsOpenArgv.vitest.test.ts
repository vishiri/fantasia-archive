import { expect, test } from 'vitest'

import {
  dedupeFaProjectPathsLastWins,
  extractFaProjectPathsFromArgv,
  pickLastFaProjectPathForOsOpen,
  resolveOsOpenFaProjectPathFromArgv
} from '../projectManagement_manager'

/**
 * extractFaProjectPathsFromArgv
 * Flag-only argv yields no project paths.
 */
test('Test that extractFaProjectPathsFromArgv returns empty for flag-only argv', () => {
  expect(extractFaProjectPathsFromArgv(['electron', '-r', 'foo'])).toEqual([])
})

/**
 * extractFaProjectPathsFromArgv
 * Accepts Windows absolute drive-letter path.
 */
test('Test that extractFaProjectPathsFromArgv accepts Windows absolute drive-letter path', () => {
  expect(
    extractFaProjectPathsFromArgv(['D:\\p\\x.faproject'])
  ).toEqual(['D:\\p\\x.faproject'])
})

/**
 * extractFaProjectPathsFromArgv
 * Accepts quoted Windows path.
 */
test('Test that extractFaProjectPathsFromArgv accepts quoted Windows path', () => {
  expect(
    extractFaProjectPathsFromArgv(['"D:\\p\\y.faproject"'])
  ).toEqual(['D:\\p\\y.faproject'])
})

/**
 * extractFaProjectPathsFromArgv
 * Accepts single-quoted POSIX path.
 */
test('Test that extractFaProjectPathsFromArgv accepts single-quoted POSIX path', () => {
  expect(
    extractFaProjectPathsFromArgv(["'/home/me/single.faproject'"])
  ).toEqual(['/home/me/single.faproject'])
})

/**
 * extractFaProjectPathsFromArgv
 * Accepts POSIX absolute path.
 */
test('Test that extractFaProjectPathsFromArgv accepts POSIX absolute path', () => {
  expect(
    extractFaProjectPathsFromArgv(['/home/me/a.faproject'])
  ).toEqual(['/home/me/a.faproject'])
})

/**
 * extractFaProjectPathsFromArgv
 * Accepts UNC share path.
 */
test('Test that extractFaProjectPathsFromArgv accepts UNC share path', () => {
  expect(
    extractFaProjectPathsFromArgv(['\\\\srv\\share\\b.faproject'])
  ).toEqual(['\\\\srv\\share\\b.faproject'])
})

/**
 * extractFaProjectPathsFromArgv
 * Skips http dev server URL while keeping project path.
 */
test('Test that extractFaProjectPathsFromArgv skips http dev server URL', () => {
  expect(
    extractFaProjectPathsFromArgv([
      'http://localhost:8080/',
      'D:\\x\\z.faproject'
    ])
  ).toEqual(['D:\\x\\z.faproject'])
})

/**
 * extractFaProjectPathsFromArgv
 * Skips --flag and plain electron executable path.
 */
test('Test that extractFaProjectPathsFromArgv skips --flag and plain electron executable path', () => {
  expect(
    extractFaProjectPathsFromArgv([
      'C:\\app\\electron.exe',
      '--inspect',
      'D:\\proj\\a.faproject'
    ])
  ).toEqual(['D:\\proj\\a.faproject'])
})

/**
 * extractFaProjectPathsFromArgv
 * Skips electron-main bundle path.
 */
test('Test that extractFaProjectPathsFromArgv skips electron-main bundle path', () => {
  expect(
    extractFaProjectPathsFromArgv([
      '/app/dist/electron-main.js',
      '/data/p.faproject'
    ])
  ).toEqual(['/data/p.faproject'])
})

/**
 * extractFaProjectPathsFromArgv
 * Rejects relative .faproject path.
 */
test('Test that extractFaProjectPathsFromArgv rejects relative .faproject path', () => {
  expect(extractFaProjectPathsFromArgv(['rel\\a.faproject'])).toEqual([])
})

/**
 * extractFaProjectPathsFromArgv
 * Preserves order for multiple projects.
 */
test('Test that extractFaProjectPathsFromArgv preserves order for multiple projects', () => {
  expect(
    extractFaProjectPathsFromArgv([
      '/a/first.faproject',
      '/b/second.faproject'
    ])
  ).toEqual(['/a/first.faproject', '/b/second.faproject'])
})

/**
 * extractFaProjectPathsFromArgv
 * Skips empty argv tokens.
 */
test('Test that extractFaProjectPathsFromArgv skips empty argv token', () => {
  expect(extractFaProjectPathsFromArgv(['', '  ', '/z/z.faproject'])).toEqual([
    '/z/z.faproject'
  ])
})

/**
 * extractFaProjectPathsFromArgv
 * Skips packaged app.asar path that is not a faproject.
 */
test('Test that extractFaProjectPathsFromArgv skips packaged app.asar path that is not a faproject', () => {
  expect(
    extractFaProjectPathsFromArgv([
      'C:\\Program Files\\FA\\resources\\app.asar',
      'C:\\data\\q.faproject'
    ])
  ).toEqual(['C:\\data\\q.faproject'])
})

/**
 * dedupeFaProjectPathsLastWins
 * Keeps last occurrence when the same logical path repeats.
 */
test('Test that dedupeFaProjectPathsLastWins keeps last occurrence when the same logical path repeats', () => {
  const out = dedupeFaProjectPathsLastWins([
    '/x/a.faproject',
    '/y/b.faproject',
    '/x/a.faproject'
  ])
  expect(out).toEqual(['/y/b.faproject', '/x/a.faproject'])
})

/**
 * dedupeFaProjectPathsLastWins
 * Ignores undefined entries when deduping.
 */
test('Test that dedupeFaProjectPathsLastWins ignores undefined entries when deduping', () => {
  const out = dedupeFaProjectPathsLastWins([
    '/x/a.faproject',
    undefined as unknown as string,
    '/y/b.faproject'
  ])
  expect(out).toEqual(['/x/a.faproject', '/y/b.faproject'])
})

/**
 * pickLastFaProjectPathForOsOpen
 * Returns null when empty.
 */
test('Test that pickLastFaProjectPathForOsOpen returns null when empty', () => {
  expect(pickLastFaProjectPathForOsOpen([])).toBeNull()
})

/**
 * pickLastFaProjectPathForOsOpen
 * Returns last path.
 */
test('Test that pickLastFaProjectPathForOsOpen returns last path', () => {
  expect(
    pickLastFaProjectPathForOsOpen(['/a/a.faproject', '/b/b.faproject'])
  ).toBe('/b/b.faproject')
})

/**
 * pickLastFaProjectPathForOsOpen
 * Returns null when last slot is undefined.
 */
test('Test that pickLastFaProjectPathForOsOpen returns null when last slot is undefined', () => {
  expect(
    pickLastFaProjectPathForOsOpen([
      '/a/a.faproject',
      undefined as unknown as string
    ])
  ).toBeNull()
})

/**
 * resolveOsOpenFaProjectPathFromArgv
 * Returns last extracted faproject.
 */
test('Test that resolveOsOpenFaProjectPathFromArgv returns last extracted faproject', () => {
  expect(
    resolveOsOpenFaProjectPathFromArgv([
      '-w',
      '/q/a.faproject',
      '/q/b.faproject'
    ])
  ).toBe('/q/b.faproject')
})
