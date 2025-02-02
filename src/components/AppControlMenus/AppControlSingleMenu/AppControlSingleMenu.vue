<template>
  <!-- Main menu - Wrapper -->
  <q-btn
    v-if="hasProperDataInput"
    flat
    class="appControlSingleMenu non-selectable"
    dark
    size="md"
    no-caps
    data-test="AppControlSingleMenu-wrapper"
    :data-test-has-proper-data-input="hasProperDataInput"
  >
    <!-- Main menu - Title -->
    <span
      v-if="menuTitle"
      data-test="AppControlSingleMenu-title"
    >
      {{ menuTitle }}
    </span>

    <!-- Main menu - Content -->
    <q-menu
      anchor="bottom left"
      square
      dark
      transition-show="jump-down"
      transition-hide="jump-up"
    >
      <q-list
        class="appControlSingleMenu__list"
        dark
      >
        <template
          v-for="(menuItem,index) in menuData"
          :key="index"
        >
          <q-separator
            v-if="menuItem.mode === 'separator'"
            class="appControlSingleMenu__separator"
            dark
          />

          <q-item
            v-if="menuItem.mode === 'item'"
            v-close-popup="menuItem.submenu === undefined ? true : false"
            clickable
            data-test="AppControlSingleMenu-menuItem"
            :class="['appControlSingleMenu__item', `text-${menuItem.specialColor}`, 'non-selectable']"
            :disable="(!menuItem.conditions)"
            @click="(menuItem.trigger)
              ? menuItem.triggerArguments
                ? menuItem.trigger(...menuItem.triggerArguments)
                : menuItem.trigger()
              : false"
          >
            <q-item-section data-test="AppControlSingleMenu-menuItem-text">
              {{ menuItem.text }}
            </q-item-section>
            <q-item-section avatar>
              <q-icon
                class="appControlSingleMenu__icon"
                :name="menuItem.icon"
                data-test="AppControlSingleMenu-menuItem-icon"
              />
            </q-item-section>

            <!-- Sub-menu -->
            <q-menu
              v-if="menuItem.submenu !== undefined"
              anchor="top end"
              self="top start"
              square
              dark
              transition-show="jump-right"
              transition-hide="jump-left"
              class="-subMenu"
              data-test="AppControlSingleMenu-menuItem-subMenu"
            >
              <q-list
                class="appControlSingleMenu__list"
                dark
              >
                <template
                  v-for="(submenuItem,subIndex) in menuItem.submenu"
                  :key="subIndex"
                >
                  <q-separator
                    v-if="submenuItem.mode === 'separator'"
                    class="appControlSingleMenu__separator"
                    dark
                  />
                  <q-item
                    v-if="submenuItem.mode === 'item'"
                    v-close-popup
                    clickable
                    :class="['appControlSingleMenu__item', `text-${submenuItem.specialColor}`, 'non-selectable']"
                    :disable="(!submenuItem.conditions)"
                    data-test="AppControlSingleMenu-menuItem-subMenu-item"
                    @click="(submenuItem.trigger) ? submenuItem.trigger() : false"
                  >
                    <q-item-section
                      data-test="AppControlSingleMenu-menuItem-subMenu-item-text"
                    >
                      {{ submenuItem.text }}
                    </q-item-section>
                    <q-item-section avatar>
                      <q-icon
                        class="appControlSingleMenu__icon"
                        data-test="AppControlSingleMenu-menuItem-subMenu-item-icon"
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
  <!-- Main menu end - Wrappper -->
</template>

<script setup lang="ts">
// TODO - ADD TESTS

import { I_appMenusDataList } from 'app/types/I_appMenusDataList'
import { testData } from '../tests/_testData'
import { computed } from 'vue'

/**
 * All component props
 */
const props = defineProps<{
  /**
   * Data input for the component
   */
  dataInput: I_appMenusDataList
}>()

/**
 * Testing type currently possibly happening
 */
const testingType = window.extraEnvVariables.TEST_ENV

const componentData = computed(() => {
  if (testingType === 'components') {
    return testData
  } else {
    return props.dataInput
  }
})

/**
 * Determines if the input has "proper" data in it
 * Checks for:
 * - Title
 * - Overall data feed
 */
const hasProperDataInput = !!(componentData.value.title && componentData.value.data)

/**
 * Menu title from the prop
 */
const menuTitle = componentData.value.title

/**
 * Menu data content from the prop
 */
const menuData = componentData.value.data

</script>

<style lang="scss" scoped>
.appControlSingleMenu {
  &:hover,
  &:focus {
    color: $appControlMenus_singleHover;
  }

  &__icon {
    font-size: $iconSize;
  }

  &__list {
    background-color: $appControlMenus_bgColor;
    color: $appControlMenus_color;
  }

  &__item {
    min-height: 42px;

    &:hover,
    &:focus {
      color: $appControlMenus_singleHover;
    }

    /* Text legibitility fix: Red and green blend too much into each other without a little shadow */
    &.text-secondary {
      text-shadow: 0 0 3px black;
    }
  }

  &__separator {
    background-color: $appControlMenus_separatorColor;
    height: 0.5px !important;
  }
}
</style>
