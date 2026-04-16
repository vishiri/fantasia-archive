import { expect, test, type Page } from '@playwright/test'

import {
  FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS,
  FANTASIA_STORYBOOK_VIEWPORT_WIDTHS
} from '../.storybook/viewportBreakpoints'
import type { I_storybookIndex } from 'app/types/I_storybookWorkspaceHarness'

/**
 * Set FA_STORYBOOK_VISUAL_VERBOSE=1 (or 'true') to print per-story progress (Story count, Done per story).
 * Warnings and errors always print.
 */
const verboseStorybookVisualLog = process.env.FA_STORYBOOK_VISUAL_VERBOSE === '1' ||
  process.env.FA_STORYBOOK_VISUAL_VERBOSE === 'true'

const vlog = (...args: unknown[]): void => {
  if (verboseStorybookVisualLog) {
    console.info(...args)
  }
}

const normalizeSnapshotName = (storyId: string): string => storyId.replaceAll(/[^a-zA-Z0-9_-]/g, '_')
const STORY_RENDER_TIMEOUT_MS = 15_000
const STORY_STEP_TIMEOUT_MS = 30_000
const SCREENSHOT_SETTLE_DELAY_MS = 1_000
const EXCLUDED_STORY_IDS = new Set<string>([
  'layouts-componenttestinglayout--with-social-contact-single-button',
  'pages-componenttesting--social-contact-single-button',
  'components-elements-fantasiamascotimage--default',
  'components-elements-fantasiamascotimage--random'
])

/**
 * Stories may opt out of the iframe root render probe when they intentionally mount no DOM under '#storybook-root' / '#root' (rare).
 * Prefer fixing the story; use this tag only with maintainer review. Excluded story ids above remain the primary skip mechanism.
 */
const SKIP_VISUAL_RENDER_ROOT_CHECK_TAG = 'skip-visual-render-check'

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeoutId = setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      })
    ])
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
  }
}

const formatCaughtError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

/**
 * Ensures the HTML report lists artifacts when a story fails before or during the snapshot step.
 * Relying only on toHaveScreenshot leaves render-time failures with no images in the report.
 */
const attachStorybookVisualFailureCapture = async (
  page: Page,
  storyId: string,
  reason: string
): Promise<void> => {
  const safeStory = normalizeSnapshotName(storyId)
  const safeReason = reason.replaceAll(/[^a-zA-Z0-9_-]/g, '_')
  const baseName = `${safeStory}__${safeReason}`

  try {
    const screenshot = await page.screenshot({
      fullPage: true
    })
    await test.info().attach(`${baseName}.png`, {
      body: screenshot,
      contentType: 'image/png'
    })
  } catch {
    // Page may be unavailable after navigation errors or teardown races.
  }

  try {
    const probe = await page.evaluate(() => {
      const root = document.querySelector('#storybook-root, #root')
      return {
        childElementCount: root?.childElementCount ?? null,
        locationHref: window.location.href,
        outerHtmlSlice: root ? root.outerHTML.slice(0, 60_000) : null
      }
    })
    await test.info().attach(`${baseName}__storybook-root-probe.json`, {
      body: Buffer.from(JSON.stringify(probe, null, 2), 'utf8'),
      contentType: 'application/json'
    })
  } catch {
    // Ignore probe failures when the page is not scriptable.
  }
}

test('Capture visual snapshots for Storybook stories', async ({ browser, request }) => {
  const indexResponse = await request.get('/index.json')
  expect(indexResponse.ok()).toBeTruthy()

  const storybookIndex = (await indexResponse.json()) as I_storybookIndex
  const storyList = Object
    .values(storybookIndex.entries)
    .filter((entry) => entry.type === 'story' && !(entry.tags ?? []).includes('skip-visual') && !EXCLUDED_STORY_IDS.has(entry.id))
    .sort((a, b) => a.id.localeCompare(b.id))

  vlog(`[storybook-visual] Story count: ${storyList.length}`)

  for (const [index, story] of storyList.entries()) {
    vlog(`[storybook-visual] (${index + 1}/${storyList.length}) ${story.id}`)
    await test.step(`${story.title} / ${story.name}`, async () => {
      const context = await browser.newContext({
        viewport: {
          height: FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS.desktop,
          width: FANTASIA_STORYBOOK_VIEWPORT_WIDTHS.desktop
        },
        colorScheme: 'dark',
        locale: 'en-US',
        timezoneId: 'UTC'
      })
      const page = await context.newPage()
      try {
        try {
          await withTimeout(page.goto(`/iframe.html?id=${story.id}&viewMode=story`, {
            waitUntil: 'load'
          }), STORY_RENDER_TIMEOUT_MS, `Timed out navigating to story: ${story.id}`)
        } catch (error) {
          await attachStorybookVisualFailureCapture(page, story.id, 'navigation-failed')
          expect.soft(false, {
            message: `[storybook-visual] navigation failed for ${story.id}: ${formatCaughtError(error)}`
          }).toBe(true)
          return
        }

        const storyRendered = await page.waitForFunction(() => {
          const root = document.querySelector('#storybook-root, #root')
          const hasRootChildren = root !== null && root.childElementCount > 0
          const hasTeleportContent = document.querySelector('.q-dialog, [role="dialog"], .q-menu') !== null
          return hasRootChildren || hasTeleportContent
        }, undefined, {
          timeout: STORY_RENDER_TIMEOUT_MS
        }).then(() => true).catch(() => false)

        if (!storyRendered) {
          if ((story.tags ?? []).includes(SKIP_VISUAL_RENDER_ROOT_CHECK_TAG)) {
            console.warn(`[storybook-visual] Skipped root render check (${SKIP_VISUAL_RENDER_ROOT_CHECK_TAG}): ${story.id}`)
            return
          }
          await attachStorybookVisualFailureCapture(page, story.id, 'render-probe-failed')
          expect.soft(storyRendered, {
            message: `[storybook-visual] story did not render in iframe (no root children / teleport): ${story.id}`
          }).toBeTruthy()
          return
        }

        try {
          await withTimeout(page.evaluate(async () => { await document.fonts.ready }), STORY_RENDER_TIMEOUT_MS, `Timed out waiting for fonts: ${story.id}`)
        } catch (error) {
          await attachStorybookVisualFailureCapture(page, story.id, 'fonts-ready-failed')
          expect.soft(false, {
            message: `[storybook-visual] fonts.ready failed for ${story.id}: ${formatCaughtError(error)}`
          }).toBe(true)
          return
        }

        await page.waitForTimeout(SCREENSHOT_SETTLE_DELAY_MS)

        const storybookRenderErrorDetails = await page.evaluate(() => {
          const errorPanels = Array.from(document.querySelectorAll('.sb-errordisplay, .sb-errordisplay-main'))
          const panelTexts: string[] = []

          const hasVisibleError = errorPanels.some((panel) => {
            const element = panel as HTMLElement
            const style = window.getComputedStyle(element)
            const rect = element.getBoundingClientRect()
            const isVisible = style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              rect.width > 0 &&
              rect.height > 0
            const panelText = element.innerText ?? ''
            const hasErrorSignature = panelText.includes('SyntaxError') ||
              panelText.includes('TypeError') ||
              panelText.includes('ReferenceError') ||
              panelText.includes('Error:')
            if (isVisible && hasErrorSignature) {
              panelTexts.push(panelText.slice(0, 500))
            }
            return isVisible && hasErrorSignature
          })

          return {
            hasVisibleError,
            panelTexts
          }
        })

        if (storybookRenderErrorDetails.hasVisibleError) {
          await attachStorybookVisualFailureCapture(page, story.id, 'storybook-error-overlay')
          expect.soft(false, {
            message: `[storybook-visual] Storybook error overlay for ${story.id}:\n${storybookRenderErrorDetails.panelTexts.join('\n---\n')}`
          }).toBe(true)
          return
        }

        try {
          // Hard expect so snapshot mismatch rejects; expect.soft resolves on failure and skips the catch below.
          await withTimeout(expect(page).toHaveScreenshot(`${normalizeSnapshotName(story.id)}.png`, {
            animations: 'disabled',
            caret: 'hide',
            // Absorb fonts/subpixel variance (local vs GitHub windows-latest Chromium); worst CI diffs ~1.6k px
            maxDiffPixels: 2000
          }), STORY_STEP_TIMEOUT_MS, `Timed out taking screenshot: ${story.id}`)
        } catch (error) {
          await attachStorybookVisualFailureCapture(page, story.id, 'screenshot-step-failed')
          expect.soft(false, {
            message: `[storybook-visual] screenshot step failed for ${story.id}: ${formatCaughtError(error)}`
          }).toBe(true)
        }
      } finally {
        await context.close().catch(() => {})
        vlog(`[storybook-visual] Done: ${story.id}`)
      }
    })
  }
})
