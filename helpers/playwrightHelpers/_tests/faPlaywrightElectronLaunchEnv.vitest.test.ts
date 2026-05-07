import process from 'node:process'

import { expect, test } from 'vitest'

import {
  buildFaPlaywrightElectronLaunchEnv,
  pickDefinedEnvStringValues
} from '../faPlaywrightElectronLaunchEnv'

test('pickDefinedEnvStringValues keeps only defined string entries', () => {
  const fakeSource: Record<string, string | undefined> = {
    drop: undefined,
    empty: '',
    keep: 'x'
  }
  expect(pickDefinedEnvStringValues(fakeSource)).toEqual({
    empty: '',
    keep: 'x'
  })
})

test('buildFaPlaywrightElectronLaunchEnv merges overrides atop process.env snapshots', () => {
  const priorNodeEnv = process.env.NODE_ENV
  const merged = buildFaPlaywrightElectronLaunchEnv({
    COMPONENT_NAME: 'DialogAboutFantasiaArchive',
    TEST_ENV: 'components'
  })
  expect(merged.COMPONENT_NAME).toBe('DialogAboutFantasiaArchive')
  expect(merged.TEST_ENV).toBe('components')
  expect(merged.NODE_ENV).toBe(priorNodeEnv)
})
