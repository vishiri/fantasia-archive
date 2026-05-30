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
import type { I_appMenuList } from 'app/types/I_appMenusDataList'

import { useAppControlSingleMenu } from './scripts/appControlSingleMenu_manager'

const props = defineProps<{
  /**
   * Data input for the component
   */
  dataInput: I_appMenuList
}>()

const {
  appControlShouldShowSeparatorAltBeforeItem,
  hasProperDataInput,
  keybindHintLabel,
  menuData,
  menuTitle,
  onMenuRowMouseEnter,
  onMenuRowMouseLeave,
  onRootMenuHide,
  onSubmenuContentEnter,
  onSubmenuContentLeave,
  onSubmenuModelUpdate,
  openSubmenuRowIndex,
  trimmedSecondaryHintText
} = useAppControlSingleMenu(props)

</script>

<style lang="scss" scoped src="./styles/AppControlSingleMenu.scoped.scss"></style>
