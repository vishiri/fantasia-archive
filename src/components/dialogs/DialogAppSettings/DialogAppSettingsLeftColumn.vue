<template>
  <!-- display:contents so search field and tabs stay flex children of the card body row (search absolute positioning matches pre-split layout). -->
  <div class="dialogAppSettings__leftColumnRoot">
    <div class="dialogAppSettings__settingsSearchWrapper">
      <q-input
        :model-value="props.searchSettingsQuery"
        :placeholder="$t('dialogs.appSettings.settingsSearchPlaceholder')"
        clearable
        dense
        dark
        debounce="300"
        class="dialogAppSettings__settingsSearchInput"
        @update:model-value="emitSearchQueryFromInput"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <q-tabs
      :model-value="props.selectedCategoryTab"
      vertical
      :class="{
        'dialogAppSettings__tabs': true,
        'dialogAppSettings__tabs--nonInteractive': hasActiveSearchQuery
      }"
      active-color="primary-bright"
      indicator-color="primary-bright"
      @update:model-value="emit('update:selectedCategoryTab', $event)"
    >
      <q-tab
        v-for="(category, categoryKey) in appSettingsTree"
        :key="categoryKey"
        :class="{ 'fa-text-muted': categoryKey !== props.selectedCategoryTab }"
        :name="categoryKey"
        :label="category.title"
        :data-test-locator="`dialogAppSettings-tab-${categoryKey}`"
      />
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'

const props = defineProps<{
  hasActiveSearchQuery: boolean
  appSettingsTree: T_appSettingsRenderTree
  searchSettingsQuery: string | null
  selectedCategoryTab: string
}>()

const emit = defineEmits<{
  'update:searchSettingsQuery': [value: string | null]
  'update:selectedCategoryTab': [value: string]
}>()

function emitSearchQueryFromInput (value: string | number | null): void {
  if (value === null || value === undefined) {
    emit('update:searchSettingsQuery', null)
    return
  }
  emit('update:searchSettingsQuery', String(value))
}
</script>

<style lang="scss" scoped>
.dialogAppSettings__leftColumnRoot {
  display: contents;
}

.dialogAppSettings__tabs {
  position: relative;
}

.dialogAppSettings__tabs--nonInteractive {
  pointer-events: none;
}

.dialogAppSettings__settingsSearchInput {
  width: 100%;
}

.dialogAppSettings__settingsSearchWrapper {
  background-color: $dialogAppSettings-surface-backgroundColor;
  pointer-events: auto;
  position: absolute;
  right: $dialogAppSettings-settingsSearchWrapper-right;
  top: $dialogAppSettings-settingsSearchWrapper-top;
  width:
    min(
      #{$dialogAppSettings-settingsSearchWrapper-widthMax},
      calc(100vw - #{$dialogAppSettings-settingsSearchWrapper-widthViewportSubtract})
    );
  z-index: $dialogAppSettings-settingsSearchWrapper-zIndex;

  &::before {
    border-bottom-left-radius: $dialogAppSettings-settingsSearchWrapper-before-borderBottomLeftRadius;
    box-shadow: $dialogAppSettings-settingsSearchWrapper-before-boxShadow;
    content: "";
    inset: $dialogAppSettings-settingsSearchWrapper-before-inset;
    opacity: 0;
    position: absolute;
    transition: $dialogAppSettings-settingsSearchWrapper-transition;
    z-index: 0;
  }

  &::after {
    content: "";
    height: $dialogAppSettings-settingsSearchWrapper-after-height;
    left: $dialogAppSettings-settingsSearchWrapper-after-left;
    opacity: 0;
    position: absolute;
    right: $dialogAppSettings-settingsSearchWrapper-after-right;
    top: $dialogAppSettings-settingsSearchWrapper-after-top;
    transition: $dialogAppSettings-settingsSearchWrapper-transition;
  }
}
</style>
