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

**`Window*`** under **`src/components/floatingWindows/`** — movable/resizable **`position: fixed`** in **same** renderer. Not extra Electron **`BrowserWindow`** instances.

## Architecture (checklist)

1. **Teleport** — **`_FaFloatingWindowBodyTeleport`** under **`document.body`**. **`Transition`** wraps single element: Teleport → Transition → frame root
2. **Composable** — **`useFaFloatingWindowFrame(visibleRef, layout?)`** from **`src/scripts/floatingWindows/`**: center, title drag, resize, **`ResizeObserver`**, **`frameStyle`** + z-index
3. **Z-index** — **`5000`–`5999`** session counters; **below `6000`** (modals/chrome). Bands: **`standard` `5000`–`5799`**, **`projectStyling` `5800`–`5899`**, app noteboard **`5900`–`5949`**, project noteboard **`5950`–`5999`**. **`raiseZ`** on open/interaction
4. **Layout** — **`I_FaFloatingWindowFrameLayout`** / **`FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT`**: fractions, min/max, per-edge margins
5. **Resize** — **`faFloatingWindowResizeGeometry.ts`**, **`faFloatingWindowResizeClamp.ts`**; **`_FaFloatingWindowFrameResizeHandles`**
6. **Modals** — **no** **`registerComponentDialogStackGuard`** for **`Window*`**
7. **i18n** — **`i18n/<locale>/floatingWindows/`**

## Open/close Transition (Custom app CSS / WindowAppStyling)

- **`faFloatingWindowPopTransition.ts`**: **`FA_FLOATING_WINDOW_POP_TRANSITION_MS`**, class **`fa-floatingWindowPop-*`**
- SCSS in **`WindowAppStyling.floatingWindowPopTransition.unscoped.scss`** — not stock **`q-transition--scale`** (breaks Electron/Monaco Playwright)

## Project Noteboard (WindowProjectNoteboard)

- Text debounce **380** ms; frame **280** ms. Frame-only save may race text debounce → **`persistProjectNoteboardPartialSilent`** merges in-memory textarea when patch omits **`text`**
- **`floatingWindowZLayer: 'projectNoteboard'`** → **`5950`–`5999`**

## Project Custom CSS (WindowProjectStyling)

- KV **`project_styling_*`**; frame **280** ms, body **380** ms; **`persistProjectStylingPartialSilent`** merges in-memory CSS on frame-only race

## Tests

- Geometry: **`faFloatingWindowResizeGeometry.vitest.test.ts`**
- Component Vitest: stub teleport binding + **`<div><slot /></div>`**
- Playwright: **`data-test-locator`** on teleported frame

## Custom app CSS help (WindowAppStyling)

**?** menu lists **`--fa-color-*`** names — logic in **`src/scripts/faTheme/`**

## Related docs

- [AGENTS.md](../../../AGENTS.md) **In-renderer floating windows**
- [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md)
