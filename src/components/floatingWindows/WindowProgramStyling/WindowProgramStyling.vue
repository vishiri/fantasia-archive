<template>
  <!-- Transition must wrap a single element root; Teleport cannot be the direct child of Transition. -->
  <FaFloatingWindowBodyTeleport>
    <!-- Custom pop: Quasar’s q-transition--scale uses scale(0) and can break in Electron/Playwright; we use a positive min scale (see faFloatingWindowPopTransition). -->
    <Transition
      v-bind="FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS"
      :duration="FA_FLOATING_WINDOW_POP_TRANSITION_MS"
    >
      <div
        v-if="windowModel"
        ref="frameRef"
        class="floatingWindowComponent windowProgramStyling"
        :class="['floatingWindowComponent', documentName]"
        :style="frameStyleWithDialogTransition"
        aria-labelledby="windowProgramStyling-title"
        data-test-locator="windowProgramStyling-frame"
        @pointerdown.self="onFramePointerDown"
      >
        <FaFloatingWindowFrameResizeHandles :on-resize-pointer-down="onResizePointerDown" />
        <q-card class="windowProgramStyling__card floatingWindowComponent__surface">
          <div
            class="windowProgramStyling__titleRow"
            data-test-locator="windowProgramStyling-dragHandle"
            @pointerdown="onTitlePointerDown"
          >
            <h4
              id="windowProgramStyling-title"
              :class="[
                'text-center',
                'floatingWindowComponent__title',
                'windowProgramStyling__title',
                titleShortFrameClass
              ]"
              data-test-locator="windowProgramStyling-title"
            >
              {{ $t('floatingWindows.programStyling.title') }}
            </h4>

            <q-icon
              name="mdi-help-circle"
              size="23px"
              class="windowProgramStyling__helpIcon"
              role="img"
              color="primary-bright"
              :aria-label="$t('floatingWindows.programStyling.helpTooltip.aria')"
              data-test-locator="windowProgramStyling-helpIcon"
            >
              <q-tooltip
                anchor="bottom right"
                self="top right"
                :delay="500"
                :offset="[0, 10]"
                class="windowProgramStyling__helpTooltip"
              >
                <div
                  class="windowProgramStyling__helpTooltipBody"
                  data-test-locator="windowProgramStyling-helpTooltipBody"
                >
                  <strong class="windowProgramStyling__helpTooltipTitle">
                    {{ $t('floatingWindows.programStyling.helpTooltip.title') }}
                  </strong>
                  <ul class="windowProgramStyling__helpTooltipList">
                    <li
                      v-for="item in monacoKeybindHelpItems"
                      :key="item.labelKey"
                      class="windowProgramStyling__helpTooltipItem"
                    >
                      <span class="windowProgramStyling__helpTooltipChord">{{ item.chord }}</span>
                      <span class="windowProgramStyling__helpTooltipLabel">
                        {{ $t(`floatingWindows.programStyling.helpTooltip.items.${item.labelKey}`) }}
                      </span>
                    </li>
                  </ul>
                  <p class="windowProgramStyling__helpTooltipFooter">
                    {{ $t('floatingWindows.programStyling.helpTooltip.footer') }}
                  </p>
                </div>
              </q-tooltip>
            </q-icon>
          </div>

          <q-card-section class="q-pa-none windowProgramStyling__body">
            <div
              ref="editorHostRef"
              class="windowProgramStyling__editorHost"
              data-test-locator="windowProgramStyling-editorHost"
            />

            <div
              v-if="monaco.isLoading.value"
              class="windowProgramStyling__loadingOverlay"
              data-test-locator="windowProgramStyling-loadingOverlay"
            >
              <q-spinner-dots
                color="primary-bright"
                size="48px"
              />
              <span class="q-ml-md">{{ $t('floatingWindows.programStyling.loading') }}</span>
            </div>

            <div
              v-if="monaco.loadError.value !== null"
              class="windowProgramStyling__loadError text-negative"
              data-test-locator="windowProgramStyling-loadError"
            >
              {{ monaco.loadError.value }}
            </div>
          </q-card-section>

          <q-card-actions
            align="right"
            class="q-mb-sm q-mt-none q-px-md q-gutter-sm windowProgramStyling__cardActions"
          >
            <q-btn
              flat
              color="accent"
              class="q-mr-xl"
              :label="$t('floatingWindows.programStyling.closeWithoutSaving')"
              data-test-locator="windowProgramStyling-button-close"
              @click="closeWithoutSaving"
            />
            <q-btn
              color="primary-bright"
              outline
              :label="$t('floatingWindows.programStyling.saveButton')"
              data-test-locator="windowProgramStyling-button-save"
              @click="saveAndCloseWindow"
            />
          </q-card-actions>
        </q-card>
      </div>
    </Transition>
  </FaFloatingWindowBodyTeleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import FaFloatingWindowBodyTeleport from 'app/src/components/floatingWindows/FaFloatingWindowBodyTeleport/FaFloatingWindowBodyTeleport.vue'
import FaFloatingWindowFrameResizeHandles from 'app/src/components/floatingWindows/FaFloatingWindowFrameResizeHandles/FaFloatingWindowFrameResizeHandles.vue'
import { getMonacoKeybindHelpItems } from 'app/src/components/floatingWindows/WindowProgramStyling/scripts/windowProgramStylingKeybindHelp'
import { useWindowProgramStyling } from 'app/src/components/floatingWindows/WindowProgramStyling/scripts/windowProgramStylingState'
import {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS
} from 'app/src/scripts/floatingWindows/faFloatingWindowPopTransition'
import { useFaFloatingWindowFrame } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFrame'

defineOptions({
  name: 'WindowProgramStyling'
})

const props = defineProps<{
  /**
   * Allows direct mounting of this window (Storybook / Playwright component test) without going through the global dialog store.
   */
  directInput?: T_dialogName
}>()

const {
  closeWithoutSaving,
  documentName,
  editorHostRef,
  monaco,
  saveAndCloseWindow,
  windowModel
} = useWindowProgramStyling(props)

const {
  frameRef,
  frameStyle,
  onFramePointerDown,
  onResizePointerDown,
  onTitlePointerDown,
  titleShortFrameClass
} = useFaFloatingWindowFrame(windowModel)

const frameStyleWithDialogTransition = computed(() => ({
  ...frameStyle.value,
  '--q-transition-duration': `${FA_FLOATING_WINDOW_POP_TRANSITION_MS}ms`
}))

/**
 * Reactive so the chord text re-evaluates if the keybinds snapshot lands while the window is open
 * (e.g. after the first 'S_FaKeybinds().refreshKeybinds()' resolves on app startup).
 */
const monacoKeybindHelpItems = computed(() => getMonacoKeybindHelpItems())
</script>

<style lang="scss" src="./styles/WindowProgramStyling.unscoped.scss"></style>
