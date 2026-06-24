import { expect, test } from 'vitest'

import {
  FA_SPLASH_RESUME_DROPDOWN_PRIMARY_TEST_LOCATOR,
  resolveSplashResumeDropdownPrimaryElement
} from '../resolveSplashResumeDropdownPrimaryElement'

test('Test that resolveSplashResumeDropdownPrimaryElement tags the primary split segment', () => {
  const root = document.createElement('div')
  const primary = document.createElement('button')
  primary.className = 'q-btn q-btn-dropdown--current'
  root.appendChild(primary)

  const resolved = resolveSplashResumeDropdownPrimaryElement({ $el: root })

  expect(resolved).toBe(primary)
  expect(primary.getAttribute('data-test-locator')).toBe(
    FA_SPLASH_RESUME_DROPDOWN_PRIMARY_TEST_LOCATOR
  )
})

test('Test that resolveSplashResumeDropdownPrimaryElement returns null without a root element', () => {
  expect(resolveSplashResumeDropdownPrimaryElement(null)).toBeNull()
})

test('Test that resolveSplashResumeDropdownPrimaryElement falls back to the first q-btn group child', () => {
  const root = document.createElement('div')
  const group = document.createElement('div')
  group.className = 'q-btn-group'
  const primary = document.createElement('button')
  primary.className = 'q-btn'
  group.appendChild(primary)
  root.appendChild(group)

  const resolved = resolveSplashResumeDropdownPrimaryElement({ $el: root })

  expect(resolved).toBe(primary)
  expect(primary.getAttribute('data-test-locator')).toBe(
    FA_SPLASH_RESUME_DROPDOWN_PRIMARY_TEST_LOCATOR
  )
})

test('Test that resolveSplashResumeDropdownPrimaryElement returns null when no primary segment exists', () => {
  const root = document.createElement('div')
  expect(resolveSplashResumeDropdownPrimaryElement({ $el: root })).toBeNull()
})
