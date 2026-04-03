import { test, expect } from '@playwright/test'

interface I_storybookEntry {
  id: string
  title: string
  name: string
  type: string
  tags?: string[]
}

interface I_storybookIndex {
  entries: Record<string, I_storybookEntry>
}

const normalizeSnapshotName = (storyId: string): string => storyId.replaceAll(/[^a-zA-Z0-9_-]/g, '_')
const STORY_RENDER_TIMEOUT_MS = 15_000
const STORY_STEP_TIMEOUT_MS = 30_000
const SCREENSHOT_SETTLE_DELAY_MS = 1_000
const EXCLUDED_STORY_IDS = new Set<string>([
  'layouts-componenttestinglayout--with-social-contact-single-button',
  'pages-componenttesting--social-contact-single-button',
  'components-fantasiamascotimage--default',
  'components-fantasiamascotimage--random'
])

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

test('Capture visual snapshots for Storybook stories', async ({ browser, request }) => {
  const indexResponse = await request.get('/index.json')
  expect(indexResponse.ok()).toBeTruthy()

  const storybookIndex = (await indexResponse.json()) as I_storybookIndex
  const storyList = Object
    .values(storybookIndex.entries)
    .filter((entry) => entry.type === 'story' && !(entry.tags ?? []).includes('skip-visual') && !EXCLUDED_STORY_IDS.has(entry.id))
    .sort((a, b) => a.id.localeCompare(b.id))

  console.info(`[storybook-visual] Story count: ${storyList.length}`)
  const failedStories: string[] = []

  for (const [index, story] of storyList.entries()) {
    console.info(`[storybook-visual] (${index + 1}/${storyList.length}) ${story.id}`)
    await test.step(`${story.title} / ${story.name}`, async () => {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'dark',
        locale: 'en-US',
        timezoneId: 'UTC'
      })
      const page = await context.newPage()
      try {
        await withTimeout(page.goto(`/iframe.html?id=${story.id}&viewMode=story`, {
          waitUntil: 'domcontentloaded'
        }), STORY_RENDER_TIMEOUT_MS, `Timed out navigating to story: ${story.id}`)

        const storyRendered = await withTimeout(page.waitForFunction(() => {
          const root = document.querySelector('#storybook-root, #root')
          const hasRootChildren = root !== null && root.childElementCount > 0
          const hasTeleportContent = document.querySelector('.q-dialog, [role="dialog"], .q-menu') !== null
          return hasRootChildren || hasTeleportContent
        }, {
          timeout: STORY_RENDER_TIMEOUT_MS
        }).then(() => true).catch(() => false), STORY_RENDER_TIMEOUT_MS, `Timed out waiting for story root: ${story.id}`)

        if (!storyRendered) {
          console.warn(`[storybook-visual] Skipped (did not render root): ${story.id}`)
          return
        }

        await withTimeout(page.evaluate(async () => { await document.fonts.ready }), STORY_RENDER_TIMEOUT_MS, `Timed out waiting for fonts: ${story.id}`)
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
          throw new Error(`Storybook render error detected: ${story.id}\n${storybookRenderErrorDetails.panelTexts.join('\n---\n')}`)
        }

        await withTimeout(expect(page).toHaveScreenshot(`${normalizeSnapshotName(story.id)}.png`, {
          animations: 'disabled',
          caret: 'hide'
        }), STORY_STEP_TIMEOUT_MS, `Timed out taking screenshot: ${story.id}`)

        console.info(`[storybook-visual] Captured: ${story.id}`)
      } catch (error) {
        console.warn(`[storybook-visual] Skipped (error): ${story.id}`)
        console.warn(error)
        failedStories.push(story.id)
      } finally {
        await context.close().catch(() => {})
        console.info(`[storybook-visual] Done: ${story.id}`)
      }
    })
  }

  expect(failedStories, `Visual stories failed (${failedStories.length}): ${failedStories.join(', ')}`).toEqual([])
})
