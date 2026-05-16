<template>
  <!-- Main menu - Wrapper -->
  <q-btn
    v-if="hasProperDataInput"
    flat
    class="appControlSingleMenu non-selectable"
    dark
    size="md"
    no-caps
    :ripple="false"
    data-test-locator="AppControlSingleMenu-wrapper"
    :data-test-has-proper-data-input="hasProperDataInput"
  >
    <!-- Main menu - Title -->
    <span
      v-if="menuTitle"
      data-test-locator="AppControlSingleMenu-title"
    >
      {{ menuTitle }}
    </span>

    <!-- Main menu - Content -->
    <q-menu
      anchor="bottom left"
      square
      dark
      role="menu"
      transition-show="jump-down"
      transition-hide="jump-up"
      @hide="onRootMenuHide"
    >
      <q-list
        class="appControlSingleMenu__list"
        dark
        role="none"
      >
        <template
          v-for="(menuItem,index) in menuData"
          :key="index"
        >
          <q-separator
            v-if="menuItem.mode === 'separator'"
            class="appControlSingleMenu__separator"
            dark
            role="separator"
          />

          <q-separator
            v-if="menuItem.mode === 'item' && appControlShouldShowSeparatorAltBeforeItem(menuData, index)"
            class="appControlSingleMenu__separatorAlt"
            dark
            role="separator"
          />

          <q-item
            v-if="menuItem.mode === 'item'"
            v-close-popup="menuItem.submenu === undefined ? true : false"
            clickable
            role="menuitem"
            data-test-locator="AppControlSingleMenu-menuItem"
            :class="['appControlSingleMenu__item', `text-${menuItem.specialColor}`, 'non-selectable']"
            :disable="(!menuItem.conditions)"
            @mouseenter="onMenuRowMouseEnter(menuItem, index)"
            @mouseleave="onMenuRowMouseLeave(menuItem)"
            @click="(menuItem.trigger)
              ? menuItem.triggerArguments
                ? menuItem.trigger(...menuItem.triggerArguments)
                : menuItem.trigger()
              : false"
          >
            <q-item-section data-test-locator="AppControlSingleMenu-menuItem-text">
              <span class="appControlSingleMenu__primaryLabel">{{ menuItem.text }}</span><div
                v-if="trimmedSecondaryHintText(menuItem.secondaryHintText)"
                class="appControlSingleMenu__keybindText appControlSingleMenu__secondaryHint fa-text-keybind-hint"
                data-test-locator="AppControlSingleMenu-menuItem-secondaryHint"
              >
                {{ trimmedSecondaryHintText(menuItem.secondaryHintText) }}
              </div><div
                v-if="keybindHintLabel(menuItem.keybindCommandId)"
                class="appControlSingleMenu__keybindText fa-text-keybind-hint"
                data-test-locator="AppControlSingleMenu-menuItem-keybind"
              >
                ({{ keybindHintLabel(menuItem.keybindCommandId) }})
              </div>
            </q-item-section>
            <q-item-section avatar>
              <q-icon
                class="appControlSingleMenu__icon"
                :name="menuItem.icon"
                data-test-locator="AppControlSingleMenu-menuItem-icon"
              />
            </q-item-section>

            <!-- Sub-menu -->
            <q-menu
              v-if="menuItem.submenu !== undefined"
              :model-value="openSubmenuRowIndex === index"
              anchor="top end"
              self="top start"
              square
              dark
              role="menu"
              transition-show="jump-right"
              transition-hide="jump-left"
              class="-subMenu"
              data-test-locator="AppControlSingleMenu-menuItem-subMenu"
              @mouseenter="onSubmenuContentEnter"
              @mouseleave="onSubmenuContentLeave"
              @update:model-value="(v) => onSubmenuModelUpdate(index, v)"
            >
              <q-list
                class="appControlSingleMenu__list"
                dark
                role="none"
              >
                <template
                  v-for="(submenuItem,subIndex) in menuItem.submenu"
                  :key="subIndex"
                >
                  <q-separator
                    v-if="submenuItem.mode === 'separator'"
                    class="appControlSingleMenu__separator"
                    dark
                    role="separator"
                  />

                  <q-separator
                    v-if="submenuItem.mode === 'item' && appControlShouldShowSeparatorAltBeforeItem(menuItem.submenu, subIndex)"
                    class="appControlSingleMenu__separatorAlt"
                    dark
                    role="separator"
                  />

                  <q-item
                    v-if="submenuItem.mode === 'item'"
                    v-close-popup
                    clickable
                    role="menuitem"
                    :class="['appControlSingleMenu__item', `text-${submenuItem.specialColor}`, 'non-selectable']"
                    :disable="(!submenuItem.conditions)"
                    data-test-locator="AppControlSingleMenu-menuItem-subMenu-item"
                    @click="(submenuItem.trigger) ? submenuItem.trigger() : false"
                  >
                    <q-item-section
                      data-test-locator="AppControlSingleMenu-menuItem-subMenu-item-text"
                    >
                      <span class="appControlSingleMenu__primaryLabel">{{ submenuItem.text }}</span><div
                        v-if="trimmedSecondaryHintText(submenuItem.secondaryHintText)"
                        class="appControlSingleMenu__keybindText appControlSingleMenu__secondaryHint fa-text-keybind-hint"
                        data-test-locator="AppControlSingleMenu-menuItem-subMenu-item-secondaryHint"
                      >
                        {{ trimmedSecondaryHintText(submenuItem.secondaryHintText) }}
                      </div><div
                        v-if="keybindHintLabel(submenuItem.keybindCommandId)"
                        class="appControlSingleMenu__keybindText fa-text-keybind-hint"
                        data-test-locator="AppControlSingleMenu-menuItem-subMenu-item-keybind"
                      >
                        ({{ keybindHintLabel(submenuItem.keybindCommandId) }})
                      </div>
                    </q-item-section>
                    <q-item-section
                      v-if="submenuItem.icon"
                      avatar
                    >
                      <q-icon
                        class="appControlSingleMenu__icon"
                        data-test-locator="AppControlSingleMenu-menuItem-subMenu-item-icon"
                        :name="submenuItem.icon"
                      />
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
            <!-- Sub-menu end -->
          </q-item>
        </template>
      </q-list>
    </q-menu>
    <!-- Main menu end - Content -->
  </q-btn>
  <!-- Main menu end - Wrapper -->
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { createAppControlSingleMenuSubmenuHover } from 'app/src/components/globals/AppControlSingleMenu/scripts/appControlSingleMenuSubmenuHover'
import { appControlShouldShowSeparatorAltBeforeItem } from 'app/src/components/globals/AppControlSingleMenu/scripts/appControlSingleMenuSeparatorAlt'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import type { I_appMenuItem, I_appMenuList } from 'app/types/I_appMenusDataList'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

const faKeybindsStore = S_FaKeybinds()

const {
  onRootMenuHide,
  onSubmenuActivatorEnter,
  onSubmenuActivatorLeave,
  onSubmenuContentEnter,
  onSubmenuContentLeave,
  onSubmenuModelUpdate,
  openSubmenuRowIndex
} = createAppControlSingleMenuSubmenuHover()

/**
 * Hover opens nested QMenus; no-op rows without a submenu.
 */
function onMenuRowMouseEnter (menuItem: I_appMenuItem, itemIndex: number): void {
  if (menuItem.submenu === undefined) {
    return
  }
  onSubmenuActivatorEnter(itemIndex)
}

/**
 * Leaving a submenu row starts the delayed hide unless the pointer entered the submenu panel.
 */
function onMenuRowMouseLeave (menuItem: I_appMenuItem): void {
  if (menuItem.submenu === undefined) {
    return
  }
  onSubmenuActivatorLeave()
}

/**
 * Shortcut hint for a menu row when `keybindCommandId` is set and keybind snapshot is loaded.
 */
function keybindHintLabel (commandId: T_faKeybindCommandId | undefined): string | null {
  return formatFaKeybindCommandLabelFromSnapshot({
    commandId,
    snapshot: faKeybindsStore.snapshot
  })
}

/**
 * Optional subtitle line (for example a path); trimmed empty strings hide the row.
 */
function trimmedSecondaryHintText (hint: string | undefined): string | null {
  const trimmed = hint?.trim()
  if (trimmed === undefined || trimmed.length === 0) {
    return null
  }
  return trimmed
}

/**
 * All component props
 */
const props = defineProps<{
  /**
   * Data input for the component
   */
  dataInput: I_appMenuList
}>()

/**
 * Data input for the component (Playwright component mode passes 'dataInput' via 'COMPONENT_PROPS'.)
 */
const componentData = computed(() => props.dataInput)

/**
 * Determines if the input has "proper" data in it
 * Checks for:
 * - Title
 * - Overall data feed
 */
const hasProperDataInput = computed(() => {
  return !!(componentData.value.title && componentData.value.data)
})

/**
 * Menu title from the prop (recomputed when dataInput changes, e.g. i18n locale).
 */
const menuTitle = computed(() => componentData.value.title)

/**
 * Menu data content from the prop (recomputed when dataInput changes).
 */
const menuData = computed(() => componentData.value.data)

</script>

<style lang="scss" scoped src="./styles/AppControlSingleMenu.scoped.scss"></style>
