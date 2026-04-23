---
name: fantasia-floating-windows
description: >-
  In-renderer floating Window* surfaces: Teleport to body, useFaFloatingWindowFrame,
  per-edge viewport margins, resize geometry and clamp, z-index band 5000–5999,
  dialog stack guard, Vitest teleport stub. Use when adding or changing Window*
  components, frame behavior, or src/scripts/floatingWindows helpers.
---

# Fantasia Archive — in-renderer floating windows

## What they are

**`Window*`** components under **`src/components/floatingWindows/`** are **movable, resizable** **`position: fixed`** UIs inside the **same** renderer as the main app. They are **not** extra Electron **`BrowserWindow`** instances.

## Architecture (checklist)

1. **Teleport** — Wrap the frame root (inside **`Transition`** if used) with **`FaFloatingWindowBodyTeleport`** so the DOM node lives under **`document.body`**. Avoids nesting under **`q-header`** / **`AppControlMenus`** where **`transform`** or stacking contexts break **`fixed`** and **`z-index`** expectations.
2. **Composable** — **`useFaFloatingWindowFrame(visibleRef, layout?)`** from **`src/scripts/floatingWindows/useFaFloatingWindowFrame.ts`**: **`centerInViewport`**, title drag (**`useFaFloatingWindowTitleDrag`**), resize (**`useFaFloatingWindowResize`** + **`computeFaFloatingWindowResizeFrame`**), **`ResizeObserver`** sync, **`frameStyle`** with **`z-index`**.
3. **Z-index** — Session counter **`5000`–`5999`**, wraps after **`5999`**. Must stay **below** **`6000`** so Quasar dialogs and app chrome (**`6000+`**, e.g. **`$mainLayout-appHeader-zIndex`**) paint above. **`raiseZ`** on open, frame **`pointerdown`**, drag start, resize start.
4. **Layout** — **`I_FaFloatingWindowFrameLayout`** / **`FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT`** in **`faFloatingWindowFrameLayout.ts`**: fractions, min/max width/height, **`marginTopPx`**, **`marginRightPx`**, **`marginBottomPx`**, **`marginLeftPx`** for centering, drag bounds, and clamping.
5. **Resize** — **`faFloatingWindowResizeGeometry.ts`**, **`faFloatingWindowResizeClamp.ts`**: per-handle viewport clamp with **anchor preservation** (west/north must not move the opposite edge incorrectly). **`FaFloatingWindowFrameResizeHandles`** + **`FA_FLOATING_WINDOW_RESIZE_HANDLE_PX`** for hit targets.
6. **Dialog stack** — Pass the same visibility ref through **`registerComponentDialogStackGuard`** (**`dialogManagement.ts`**) as modal **`Dialog*`** surfaces.
7. **i18n** — Strings under **`i18n/<locale>/floatingWindows/`** (locale modules such as **`L_programStyling.ts`**; keys like **`floatingWindows.programStyling.*`**).

## Tests

- **Geometry** — **`src/scripts/floatingWindows/_tests/faFloatingWindowResizeGeometry.vitest.test.ts`** (and related). Tests may use a **spread** of **`FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT`** with **smaller** **`minWidthPx` / `minHeightPx`** when assertions need resize math not dominated by production minimums.
- **Component Vitest** — Stub **`FaFloatingWindowBodyTeleport`** as **`<div><slot /></div>`** so **`mount(...).find('[data-test-locator=…]')`** still finds nodes (real Teleport moves content to **`body`**).
- **Playwright** — Locators unchanged; frame keeps **`data-test-locator`** on the teleported node.

## Related docs

- [AGENTS.md](../../../AGENTS.md) **In-renderer floating windows**
- [README.md](../../../README.md) **Architecture** and **Renderer components** table
- [.cursor/skills/fantasia-quasar-vue/SKILL.md](../fantasia-quasar-vue/SKILL.md) component buckets
- [.cursor/rules/vue-quasar.mdc](../../rules/vue-quasar.mdc) SFC patterns
