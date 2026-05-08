import type { Page } from 'playwright'

/**
 * Injects a high z-index dot that follows pointer `clientX` / `clientY` in the renderer so WebM screen captures show where Playwright drives the mouse.
 * The OS cursor is often omitted from window-buffer video; synthetic `mousemove` events still update this marker.
 * No-op when `FA_PLAYWRIGHT_NO_VIDEO` is set, or when `FA_PLAYWRIGHT_CURSOR_MARKER` is `0` / `false`.
 *
 * @param page - Electron BrowserWindow page (first window from `electronApp.firstWindow()`).
 */
export async function installFaPlaywrightCursorMarkerIfVideoEnabled (page: Page): Promise<void> {
  if (
    process.env.FA_PLAYWRIGHT_NO_VIDEO === '1' ||
    process.env.FA_PLAYWRIGHT_NO_VIDEO === 'true'
  ) {
    return
  }
  if (
    process.env.FA_PLAYWRIGHT_CURSOR_MARKER === '0' ||
    process.env.FA_PLAYWRIGHT_CURSOR_MARKER === 'false'
  ) {
    return
  }

  await page.evaluate(() => {
    const existing = document.getElementById('fa-playwright-cursor-marker')
    if (existing !== null) {
      return
    }

    const dot = document.createElement('div')
    dot.id = 'fa-playwright-cursor-marker'
    dot.setAttribute('data-fa-playwright-cursor-marker', '')
    dot.style.cssText = [
      'position:fixed',
      'left:0',
      'top:0',
      'width:14px',
      'height:14px',
      'border-radius:50%',
      'background:rgba(255,68,68,0.92)',
      'border:2px solid #fff',
      'pointer-events:none',
      'z-index:2147483647',
      'transform:translate(-50%,-50%)',
      'box-shadow:0 0 6px rgba(0,0,0,0.55)',
      'opacity:0',
      'transition:opacity 80ms ease-out'
    ].join(';')
    document.body.appendChild(dot)

    const move = (clientX: number, clientY: number): void => {
      dot.style.left = `${clientX}px`
      dot.style.top = `${clientY}px`
      dot.style.opacity = '1'
    }

    document.addEventListener(
      'mousemove',
      (event: MouseEvent) => {
        move(event.clientX, event.clientY)
      },
      true
    )
  })
}
