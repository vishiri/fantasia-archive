---
name: fantasia-floating-windows
description: >-
  In-renderer floating Window* surfaces: Teleport to body, useFaFloatingWindowFrame,
  per-edge viewport margins, resize geometry and clamp, z-index band 5000–5999,
  Vitest teleport stub, custom fa-floatingWindowPop open/close transition. Use when adding or changing Window*
  components, frame behavior, or src/scripts/floatingWindows helpers.
---

# Fantasia Archive — in-renderer floating windows

## What they are

**`Window*`** components under **`src/components/floatingWindows/`** are **movable, resizable** **`position: fixed`** UIs inside the **same** renderer as the main app. They are **not** extra Electron **`BrowserWindow`** instances.

## Architecture (checklist)

1. **Teleport** — Wrap the frame root (inside **`Transition`** if used) with **`_FaFloatingWindowBodyTeleport`** so the DOM node lives under **`document.body`**. Avoids nesting under **`q-header`** / **`AppControlMenus`** where **`transform`** or stacking contexts break **`fixed`** and **`z-index`** expectations. **`Transition`**, when used, must wrap a **single** element; in **`WindowProgramStyling`**, the order is **Teleport** → **Transition** → frame root **`div`**.
2. **Composable** — **`useFaFloatingWindowFrame(visibleRef, layout?)`** from **`src/scripts/floatingWindows/useFaFloatingWindowFrame.ts`**: **`centerInViewport`**, title drag (**`useFaFloatingWindowTitleDrag`**), resize (**`useFaFloatingWindowResize`** + **`computeFaFloatingWindowResizeFrame`**), **`ResizeObserver`** sync, **`frameStyle`** with **`z-index`**.
3. **Z-index** — Session counter **`5000`–`5999`**, wraps after **`5999`**. Must stay **below** **`6000`** so Quasar dialogs and app chrome (**`6000+`**, e.g. **`$mainLayout-appHeader-zIndex`**) paint above. **`raiseZ`** on open, frame **`pointerdown`**, drag start, resize start.
4. **Layout** — **`I_FaFloatingWindowFrameLayout`** / **`FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT`** in **`faFloatingWindowFrameLayout.ts`**: fractions, min/max width/height, **`marginTopPx`**, **`marginRightPx`**, **`marginBottomPx`**, **`marginLeftPx`** for centering, drag bounds, and clamping.
5. **Resize** — **`faFloatingWindowResizeGeometry.ts`**, **`faFloatingWindowResizeClamp.ts`**: per-handle viewport clamp with **anchor preservation** (west/north must not move the opposite edge incorrectly). **`_FaFloatingWindowFrameResizeHandles`** + **`FA_FLOATING_WINDOW_RESIZE_HANDLE_PX`** for hit targets.
6. **Modals** — **Do not** use **`registerComponentDialogStackGuard`** for **`Window*`**; that guard exists so **`openDialog*`** can serialize **modal** `QDialog` instances. Floating windows sit in a lower z-index band; multiple **`Window*`** and modal dialogs can be open at once.
7. **i18n** — Strings under **`i18n/<locale>/floatingWindows/`** (locale modules such as **`L_programStyling.ts`**; keys like **`floatingWindows.programStyling.*`**).

## Open/close **Transition** (Custom program **CSS** / **`WindowProgramStyling`**)

- **Bindings** — **`src/scripts/floatingWindows/faFloatingWindowPopTransition.ts`**: **`FA_FLOATING_WINDOW_POP_TRANSITION_MS`**, **`FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS`** (class names **`fa-floatingWindowPop-*`**).
- **Styles** — **`WindowProgramStyling/…/WindowProgramStyling.floatingWindowPopTransition.unscoped.scss`**, loaded from **`WindowProgramStyling.unscoped.scss`**: opacity and **`transform: scale`** with a **non-zero** minimum (tune **`$fa-floatingWindowPop-scale-from`**), **300 ms** QDialog-style pop.
- **Not** Quasar stock **`q-transition--scale`**: that uses **scale(0)** in enter-from and can break **Electron** and **Monaco** **Playwright** checks. **Reference** — stock **`q-transition`…** names and **300 ms** in **`faQuasarDialogStandardTransition.ts`**.

## Tests

- **Geometry** — **`src/scripts/floatingWindows/_tests/faFloatingWindowResizeGeometry.vitest.test.ts`** (and related). Tests may use a **spread** of **`FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT`** with **smaller** **`minWidthPx` / `minHeightPx`** when assertions need resize math not dominated by production minimums.
- **Component Vitest** — Stub the body teleport with the **same key the parent uses** (for example **`FaFloatingWindowBodyTeleport`** in **`WindowProgramStyling.vitest.test.ts`**) and **`<div><slot /></div>`** so **`mount(...).find('[data-test-locator=…]')`** still finds nodes (real Teleport moves content to **`body`**).
- **Playwright** — Locators unchanged; frame keeps **`data-test-locator`** on the teleported node.

## Related docs

- [AGENTS.md](../../../AGENTS.md) **In-renderer floating windows**
- [README.md](../../../README.md) **Architecture** and **Renderer components** table
- [.cursor/skills/fantasia-quasar-vue/SKILL.md](../fantasia-quasar-vue/SKILL.md) component buckets
- [.cursor/rules/vue-quasar.mdc](../../rules/vue-quasar.mdc) SFC patterns
