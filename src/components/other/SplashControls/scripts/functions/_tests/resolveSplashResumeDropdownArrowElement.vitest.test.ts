import { expect, test } from 'vitest'

import { resolveSplashResumeDropdownArrowElement } from '../resolveSplashResumeDropdownArrowElement'

const BROWSE_LATEST_COPY = 'splashPage.browseLatestProjects'

/**
 * resolveSplashResumeDropdownArrowElement
 * Finds the split arrow segment on splash resume-latest dropdown for tooltip anchoring.
 */
test('Test that resolve wires browse-latest copy onto the arrow container', () => {
  const arrow = document.createElement('button')
  arrow.className = 'q-btn-dropdown__arrow-container'
  const root = document.createElement('div')
  root.appendChild(arrow)

  const instance = { $el: root }

  const resolved = resolveSplashResumeDropdownArrowElement(instance, BROWSE_LATEST_COPY)

  expect(resolved).toBe(arrow)
  expect(arrow.getAttribute('data-test-tooltip-text')).toBe(BROWSE_LATEST_COPY)
})

test('Test that resolve returns null without an arrow container', () => {
  const root = document.createElement('div')
  const instance = { $el: root }

  expect(resolveSplashResumeDropdownArrowElement(instance, BROWSE_LATEST_COPY)).toBeNull()
})

test('Test that resolve returns null without an instance root', () => {
  expect(resolveSplashResumeDropdownArrowElement(null, BROWSE_LATEST_COPY)).toBeNull()
})

test('Test that resolve returns null when root is not an HTMLElement', () => {
  const instance = { $el: {} }

  expect(resolveSplashResumeDropdownArrowElement(instance, BROWSE_LATEST_COPY)).toBeNull()
})
