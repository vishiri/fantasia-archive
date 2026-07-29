<template>
  <!-- display:contents so search field and tabs stay flex children of the card body row (search absolute positioning matches pre-split layout). -->
  <div class="dialogAppSettings__leftColumnRoot">
    <div class="dialogAppSettings__settingsSearchWrapper">
      <q-input
        :model-value="props.searchSettingsQuery"
        :placeholder="$t('dialogs.appSettings.settingsSearchPlaceholder')"
        dense
        dark
        debounce="300"
        class="dialogAppSettings__settingsSearchInput"
        @update:model-value="emitSearchQueryFromInput"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template
          v-if="showsSettingsSearchClear"
          #append
        >
          <q-btn
            color="secondary"
            dense
            flat
            icon="mdi-close"
            round
            size="sm"
            :aria-label="$t('dialogs.appSettings.settingsSearchClearAriaLabel')"
            data-test-locator="dialogAppSettings-settingsSearchClear"
            @click.stop="clearSettingsSearchQuery"
          />
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
      @update:model-value="onSelectedCategoryTabUpdate"
    >
      <q-tab
        v-for="(category, categoryKey) in appSettingsTree"
        :key="categoryKey"
        :class="{ 'fa-text-muted': categoryKey !== props.selectedCategoryTab }"
        :disable="hasActiveSearchQuery"
        :name="categoryKey"
        :label="category.title"
        :data-test-locator="`dialogAppSettings-tab-${categoryKey}`"
      />
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const showsSettingsSearchClear = computed(
  () => (props.searchSettingsQuery ?? '').length > 0
)

function emitSearchQueryFromInput (value: string | number | null): void {
  if (value === null || value === undefined) {
    emit('update:searchSettingsQuery', null)
    return
  }
  emit('update:searchSettingsQuery', String(value))
}

function clearSettingsSearchQuery (): void {
  emit('update:searchSettingsQuery', null)
}

function onSelectedCategoryTabUpdate (value: unknown): void {
  if (props.hasActiveSearchQuery) {
    return
  }
  emit('update:selectedCategoryTab', String(value))
}
</script>

<style lang="scss" scoped>
.dialogAppSettings__leftColumnRoot {
  display: contents;
}

.dialogAppSettings__tabs {
  /* Above painted vertical separator so right-edge glow can overlap it. */
  filter: grayscale(0);
  opacity: 1;
  position: relative;
  transition:
    filter $dialogAppSettings-tabsNonInteractive-transitionDuration
    $dialogAppSettings-tabsNonInteractive-transitionTiming,
    opacity $dialogAppSettings-tabsNonInteractive-transitionDuration
    $dialogAppSettings-tabsNonInteractive-transitionTiming;
  z-index: $faTabEdgeGlow-zIndex;
}

/* Search on: grey fade + not-allowed cursor; clicks blocked via :disable + emit guard. */
.dialogAppSettings__tabs--nonInteractive {
  cursor: not-allowed;
  filter: grayscale($dialogAppSettings-tabsNonInteractive-grayscale);
  opacity: $dialogAppSettings-tabsNonInteractive-opacity;

  :deep(.q-tab) {
    cursor: not-allowed;

    /* Parent already fades; avoid stacking Quasar .disabled opacity. */
    &.disabled {
      opacity: 1 !important;
    }

    /* Kill fantasy edge glow while faded. */
    &::after {
      opacity: 0 !important;
    }
  }
}

.dialogAppSettings__settingsSearchInput {
  width: 100%;
}

.dialogAppSettings__settingsSearchWrapper {
  pointer-events: auto;
  position: absolute;
  right: $dialogAppSettings-settingsSearchWrapper-right;
  top: $dialogAppSettings-settingsSearchWrapper-top;
  width: $dialogAppSettings-settingsSearchWrapper-width !important;
  z-index: $dialogAppSettings-settingsSearchWrapper-zIndex;
}
</style>
