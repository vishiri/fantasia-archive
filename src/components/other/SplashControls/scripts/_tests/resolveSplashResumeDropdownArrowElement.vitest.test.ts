import { expect, test } from 'vitest'

import type { ComponentPublicInstance } from 'vue'

import { resolveSplashResumeDropdownArrowElement } from '../resolveSplashResumeDropdownArrowElement'

/**
 * resolveSplashResumeDropdownArrowElement
 * Finds the split arrow segment on splash resume-latest dropdown for tooltip anchoring.
 */
test('Test that resolve wires browse-latest copy onto the arrow container', () => {
  const arrow = document.createElement('button')
  arrow.className = 'q-btn-dropdown__arrow-container'
  const root = document.createElement('div')
  root.appendChild(arrow)

  const instance = { $el: root } as unknown as ComponentPublicInstance

  const resolved = resolveSplashResumeDropdownArrowElement(instance)

  expect(resolved).toBe(arrow)
  expect(arrow.getAttribute('data-test-tooltip-text')).toBe('splashPage.browseLatestProjects')
})

test('Test that resolve returns null without an arrow container', () => {
  const root = document.createElement('div')
  const instance = { $el: root } as unknown as ComponentPublicInstance

  expect(resolveSplashResumeDropdownArrowElement(instance)).toBeNull()
})

test('Test that resolve returns null without an instance root', () => {
  expect(resolveSplashResumeDropdownArrowElement(null)).toBeNull()
})

test('Test that resolve returns null when root is not an HTMLElement', () => {
  const instance = { $el: {} } as unknown as ComponentPublicInstance

  expect(resolveSplashResumeDropdownArrowElement(instance)).toBeNull()
})
