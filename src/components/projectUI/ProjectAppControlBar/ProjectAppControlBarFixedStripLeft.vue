<template>
  <div class="projectAppControlBarFixedStripLeft">
    <template v-if="showGuideButtons">
      <q-btn
        color="primary-bright"
        data-test-locator="projectAppControlBar-keyboardShortcutsButton"
        icon="mdi-keyboard-settings"
        outline
        @click="onKeyboardShortcutsClick"
      >
        <q-tooltip
          anchor="bottom middle"
          class="projectAppControlBar__buttonTooltip"
          :delay="500"
          self="top middle"
        >
          <div class="fa-tooltip-keybind-stack">
            <span class="fa-tooltip-keybind-stack__label">
              {{ keyboardShortcutsTooltip }}
            </span><div
              v-if="keyboardShortcutsKeybindLabel !== null"
              class="fa-tooltip-keybind-hint fa-text-keybind-hint"
              data-test-locator="projectAppControlBar-keyboardShortcutsButton-keybind"
            >
              ({{ keyboardShortcutsKeybindLabel }})
            </div>
          </div>
        </q-tooltip>
      </q-btn>
      <q-btn
        color="primary-bright"
        data-test-locator="projectAppControlBar-advancedSearchGuideButton"
        icon="mdi-file-question"
        outline
        @click="onAdvancedSearchGuideClick"
      >
        <q-tooltip
          anchor="bottom middle"
          class="projectAppControlBar__buttonTooltip"
          :delay="500"
          self="top middle"
        >
          <div class="fa-tooltip-keybind-stack">
            <span class="fa-tooltip-keybind-stack__label">
              {{ advancedSearchGuideTooltip }}
            </span><div
              v-if="advancedSearchGuideKeybindLabel !== null"
              class="fa-tooltip-keybind-hint fa-text-keybind-hint"
              data-test-locator="projectAppControlBar-advancedSearchGuideButton-keybind"
            >
              ({{ advancedSearchGuideKeybindLabel }})
            </div>
          </div>
        </q-tooltip>
      </q-btn>
      <q-btn
        color="primary-bright"
        data-test-locator="projectAppControlBar-tipsTricksTriviaButton"
        icon="mdi-fire-alert"
        outline
        @click="onTipsTricksTriviaClick"
      >
        <q-tooltip
          anchor="bottom middle"
          class="projectAppControlBar__buttonTooltip"
          :delay="500"
          self="top middle"
        >
          {{ tipsTricksTriviaTooltip }}
        </q-tooltip>
      </q-btn>
      <q-separator
        v-if="showFunctionButtons || showContentButtons"
        vertical
        aria-hidden="true"
        class="projectAppControlBar__actionSeparator"
        data-test-locator="projectAppControlBar-leftGuidesSeparator"
      />
    </template>
    <template v-if="showFunctionButtons">
      <q-btn
        color="primary-bright"
        data-test-locator="projectAppControlBar-toggleHierarchyTreeButton"
        icon="mdi-page-layout-sidebar-left"
        outline
        @click="onToggleHierarchyTreeClick"
      >
        <q-tooltip
          anchor="bottom middle"
          class="projectAppControlBar__buttonTooltip"
          :delay="500"
          self="top middle"
        >
          <div class="fa-tooltip-keybind-stack">
            <span class="fa-tooltip-keybind-stack__label">
              {{ toggleHierarchyTreeTooltip }}
            </span><div
              v-if="toggleHierarchyTreeKeybindLabel !== null"
              class="fa-tooltip-keybind-hint fa-text-keybind-hint"
              data-test-locator="projectAppControlBar-toggleHierarchyTreeButton-keybind"
            >
              ({{ toggleHierarchyTreeKeybindLabel }})
            </div>
          </div>
        </q-tooltip>
      </q-btn>
      <q-btn
        color="primary-bright"
        data-test-locator="projectAppControlBar-toggleAppNoteboardButton"
        icon="mdi-clipboard-text-outline"
        outline
        @click="onToggleAppNoteboardClick"
      >
        <q-tooltip
          anchor="bottom middle"
          class="projectAppControlBar__buttonTooltip"
          :delay="500"
          self="top middle"
        >
          <div class="fa-tooltip-keybind-stack">
            <span class="fa-tooltip-keybind-stack__label">
              {{ toggleAppNoteboardTooltip }}
            </span><div
              v-if="toggleAppNoteboardKeybindLabel !== null"
              class="fa-tooltip-keybind-hint fa-text-keybind-hint"
              data-test-locator="projectAppControlBar-toggleAppNoteboardButton-keybind"
            >
              ({{ toggleAppNoteboardKeybindLabel }})
            </div>
          </div>
        </q-tooltip>
      </q-btn>
      <q-btn
        color="primary-bright"
        data-test-locator="projectAppControlBar-toggleProjectNoteboardButton"
        icon="mdi-notebook-edit-outline"
        outline
        @click="onToggleProjectNoteboardClick"
      >
        <q-tooltip
          anchor="bottom middle"
          class="projectAppControlBar__buttonTooltip"
          :delay="500"
          self="top middle"
        >
          <div class="fa-tooltip-keybind-stack">
            <span class="fa-tooltip-keybind-stack__label">
              {{ toggleProjectNoteboardTooltip }}
            </span><div
              v-if="toggleProjectNoteboardKeybindLabel !== null"
              class="fa-tooltip-keybind-hint fa-text-keybind-hint"
              data-test-locator="projectAppControlBar-toggleProjectNoteboardButton-keybind"
            >
              ({{ toggleProjectNoteboardKeybindLabel }})
            </div>
          </div>
        </q-tooltip>
      </q-btn>
      <q-separator
        v-if="showContentButtons"
        vertical
        aria-hidden="true"
        class="projectAppControlBar__actionSeparator"
        data-test-locator="projectAppControlBar-leftTreeNoteboardSeparator"
      />
    </template>
    <template v-if="showContentButtons">
      <q-btn
        color="primary-bright"
        data-test-locator="projectAppControlBar-quickSearchButton"
        icon="mdi-database-search"
        outline
        @click="onQuickSearchClick"
      >
        <q-tooltip
          anchor="bottom middle"
          class="projectAppControlBar__buttonTooltip"
          :delay="500"
          self="top middle"
        >
          {{ quickSearchTooltip }}
        </q-tooltip>
      </q-btn>
      <q-btn
        color="primary-bright"
        data-test-locator="projectAppControlBar-quickAddButton"
        icon="mdi-text-box-plus-outline"
        outline
        @click="onQuickAddClick"
      >
        <q-tooltip
          anchor="bottom middle"
          class="projectAppControlBar__buttonTooltip"
          :delay="500"
          self="top middle"
        >
          {{ quickAddTooltip }}
        </q-tooltip>
      </q-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectAppControlBarFixedStripLeft'
})

defineProps<{
  advancedSearchGuideKeybindLabel: string | null
  advancedSearchGuideTooltip: string
  keyboardShortcutsKeybindLabel: string | null
  keyboardShortcutsTooltip: string
  onAdvancedSearchGuideClick: () => void
  onKeyboardShortcutsClick: () => void
  onQuickAddClick: () => void
  onQuickSearchClick: () => void
  onTipsTricksTriviaClick: () => void
  onToggleAppNoteboardClick: () => void
  onToggleHierarchyTreeClick: () => void
  onToggleProjectNoteboardClick: () => void
  quickAddTooltip: string
  quickSearchTooltip: string
  showContentButtons: boolean
  showFunctionButtons: boolean
  showGuideButtons: boolean
  tipsTricksTriviaTooltip: string
  toggleAppNoteboardKeybindLabel: string | null
  toggleAppNoteboardTooltip: string
  toggleHierarchyTreeKeybindLabel: string | null
  toggleHierarchyTreeTooltip: string
  toggleProjectNoteboardKeybindLabel: string | null
  toggleProjectNoteboardTooltip: string
}>()
</script>
