<template>
  <!-- display:contents so search field and tabs stay flex children of the card body row (search absolute positioning matches pre-split layout). -->
  <div class="dialogProgramSettings__leftColumnRoot">
    <div class="dialogProgramSettings__settingsSearchWrapper">
      <q-input
        :model-value="props.searchSettingsQuery"
        :placeholder="$t('dialogs.programSettings.settingsSearchPlaceholder')"
        clearable
        dense
        dark
        debounce="300"
        class="dialogProgramSettings__settingsSearchInput"
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
        'dialogProgramSettings__tabs': true,
        'dialogProgramSettings__tabs--nonInteractive': hasActiveSearchQuery
      }"
      active-color="primary-bright"
      indicator-color="primary-bright"
      @update:model-value="emit('update:selectedCategoryTab', $event)"
    >
      <q-tab
        v-for="(category, categoryKey) in programSettingsTree"
        :key="categoryKey"
        class="text-grey-5"
        :name="categoryKey"
        :label="category.title"
        :data-test-locator="`dialogProgramSettings-tab-${categoryKey}`"
      />
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import type { T_programSettingsRenderTree } from 'app/types/I_dialogProgramSettings'

const props = defineProps<{
  hasActiveSearchQuery: boolean
  programSettingsTree: T_programSettingsRenderTree
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
.dialogProgramSettings__leftColumnRoot {
  display: contents;
}

.dialogProgramSettings__tabs {
  position: relative;
}

.dialogProgramSettings__tabs--nonInteractive {
  pointer-events: none;
}

.dialogProgramSettings__settingsSearchInput {
  width: 100%;
}

.dialogProgramSettings__settingsSearchWrapper {
  background-color: $dark;
  pointer-events: auto;
  position: absolute;
  right: $dialogProgramSettings-settingsSearchWrapper-right;
  top: $dialogProgramSettings-settingsSearchWrapper-top;
  width:
    min(
      #{$dialogProgramSettings-settingsSearchWrapper-widthMax},
      calc(100vw - #{$dialogProgramSettings-settingsSearchWrapper-widthViewportSubtract})
    );
  z-index: $dialogProgramSettings-settingsSearchWrapper-zIndex;

  &::before {
    border-bottom-left-radius: $dialogProgramSettings-settingsSearchWrapper-before-borderBottomLeftRadius;
    box-shadow: $dialogProgramSettings-settingsSearchWrapper-before-boxShadow;
    content: "";
    inset: $dialogProgramSettings-settingsSearchWrapper-before-inset;
    opacity: 0;
    position: absolute;
    transition: $dialogProgramSettings-settingsSearchWrapper-transition;
    z-index: 0;
  }

  &::after {
    content: "";
    height: $dialogProgramSettings-settingsSearchWrapper-after-height;
    left: $dialogProgramSettings-settingsSearchWrapper-after-left;
    opacity: 0;
    position: absolute;
    right: $dialogProgramSettings-settingsSearchWrapper-after-right;
    top: $dialogProgramSettings-settingsSearchWrapper-after-top;
    transition: $dialogProgramSettings-settingsSearchWrapper-transition;
  }
}
</style>
