---
name: fantasia-context-menu-dividers
description: >-
  Context menu divider policy: full primary-bright group separators vs low-opacity
  separatorAlt between consecutive items in the same group. Use when adding or editing
  q-menu q-list rows, AppControlSingleMenu data, or hand-built context menus.
---

# Context menu dividers

Rule: [fa-context-menu-dividers.mdc](../../rules/fa-context-menu-dividers.mdc).

## Quick rule

| Situation | Divider |
| --- | --- |
| Section / group break | **Group separator** — **`primary-bright`**, full opacity |
| 2nd+ item in same group, no group line above | **separatorAlt** — **`text-menu-separator`**, **`opacity: 0.2`** |
| Right after group separator | **Nothing** |

## Data-driven menus

**`AppControlSingleMenu`** + **`AppControlMenus/_data/*`**: insert **`{ mode: 'separator' }`** only for group breaks. Renderer adds separatorAlt via **`contextMenuShouldShowSeparatorAltBeforeItem`**.

## Hand-built menus

1. Group breaks: **`<q-separator class="…__separator" />`** before first row of new section (or after prior section).
2. Within section: **`<q-separator class="…__separatorAlt" />`** before each item after the first in that section.
3. **`v-for` lists** (recent projects, browse tabs, locales): **`v-if="contextMenuShouldShowSeparatorAltBeforeIndex(index)"`** before **`q-item`**; do not use full separators between homogeneous rows.

Helper: **`AppControlMenus/scripts/functions/contextMenuShouldShowSeparatorAltBeforeItem.ts`**.

## SCSS

```scss
@use '../../../globals/AppControlMenus/styles/contextMenuSeparators.mixin' as contextMenuSeparators;

.feature__separator {
  @include contextMenuSeparators.fa-context-menu-separator-group;
}

.feature__separatorAlt {
  @include contextMenuSeparators.fa-context-menu-separator-alt;
}
```

Import path depth varies by feature folder.

Tokens: **`AppControlMenus/styles/_variables.scss`** — **`$appControlMenus-separatorColor`**, **`$appControlMenus-separatorAltColor`**.

## Inventory (action-row menus)

| Surface | Pattern |
| --- | --- |
| **`AppControlSingleMenu`** | Auto separatorAlt + data group separators |
| Document tab context menu + browse submenu | Hand-built; reference implementation |
| **`ProjectHierarchyTreeNodeContextMenu`** | Hand-built |
| **`GlobalLanguageSelector`** | Light theme; separatorAlt between locales |
| **`SplashControlsResumeDropdown`** | separatorAlt between recent projects |
| Color palette swatch context menu | Group separator duplicate → delete only |

## Tests

- **`contextMenuShouldShowSeparatorAltBeforeItem.vitest.test.ts`** (AppControlMenus)
- **`AppControlSingleMenu.vitest.test.ts`** — separatorAlt presence/absence
- Feature vitest: row clicks still work; optional separator class count when behavior is non-obvious

## Related

- [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md)
- [vue-bem-scss.mdc](../../rules/vue-bem-scss.mdc)
