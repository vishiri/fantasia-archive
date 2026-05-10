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
        class="floatingWindowComponent windowAppStyling"
        :class="['floatingWindowComponent', documentName]"
        :style="frameStyleWithDialogTransition"
        aria-labelledby="windowAppStyling-title"
        data-test-locator="windowAppStyling-frame"
        @pointerdown.self="onFramePointerDown"
      >
        <FaFloatingWindowFrameResizeHandles :on-resize-pointer-down="onResizePointerDown" />
        <q-card class="windowAppStyling__card floatingWindowComponent__surface">
          <div
            class="windowAppStyling__titleRow"
            data-test-locator="windowAppStyling-dragHandle"
            @pointerdown="onTitlePointerDown"
          >
            <h5
              id="windowAppStyling-title"
              :class="[
                'text-center',
                'text-h5',
                'floatingWindowComponent__title',
                'windowAppStyling__title',
                titleShortFrameClass
              ]"
              data-test-locator="windowAppStyling-title"
            >
              {{ $t('floatingWindows.appStyling.title') }}
            </h5>
          </div>

          <q-card-section class="q-pa-none windowAppStyling__body">
            <q-icon
              name="mdi-help-circle"
              size="23px"
              class="windowAppStyling__helpIcon"
              role="img"
              color="primary-bright"
              :aria-label="$t('floatingWindows.appStyling.helpTooltip.aria')"
              data-test-locator="windowAppStyling-helpIcon"
              @mouseenter="onHelpIconMouseEnter"
              @mouseleave="onHelpIconMouseLeave"
            >
              <q-menu
                v-model="helpKeybindMenuOpen"
                anchor="bottom right"
                class="windowAppStyling__helpTooltip"
                data-test-locator="windowAppStyling-helpMenu"
                :dark="false"
                :offset="[0, 10]"
                self="top right"
                no-focus
                :transition-duration="300"
              >
                <div
                  class="windowAppStyling__helpTooltipBody"
                  data-test-locator="windowAppStyling-helpTooltipBody"
                >
                  <div class="windowAppStyling__helpTooltipKeybinds">
                    <strong class="windowAppStyling__helpTooltipTitle">
                      {{ $t('floatingWindows.appStyling.helpTooltip.title') }}
                    </strong>
                    <ul class="windowAppStyling__helpTooltipList">
                      <li
                        v-for="item in monacoKeybindHelpItems"
                        :key="item.labelKey"
                        class="windowAppStyling__helpTooltipItem"
                      >
                        <span class="windowAppStyling__helpTooltipChord">{{ item.chord }}</span>
                        <span class="windowAppStyling__helpTooltipLabel">
                          {{ $t(`floatingWindows.appStyling.helpTooltip.items.${item.labelKey}`) }}
                        </span>
                      </li>
                    </ul>
                    <p class="windowAppStyling__helpTooltipFooter">
                      {{ $t('floatingWindows.appStyling.helpTooltip.footer') }}
                    </p>
                  </div>
                  <q-separator
                    class="fa-separator-grey-lighter"
                    inset
                    vertical
                  />
                  <div class="windowAppStyling__helpTooltipVariableList">
                    <strong class="windowAppStyling__helpTooltipTitle">
                      {{ $t('floatingWindows.appStyling.helpTooltip.variableListTitle') }}
                    </strong>
                    <ul
                      class="windowAppStyling__helpTooltipFaVarList hasScrollbar"
                      data-test-locator="windowAppStyling-faThemeVarList"
                    >
                      <li
                        v-for="name in faThemeCustomPropertyNames"
                        :key="name"
                        class="windowAppStyling__helpTooltipFaVarItem"
                        :data-test-fa-theme-var="name"
                      >
                        <span
                          class="windowAppStyling__helpTooltipFaVarSwatch"
                          :style="buildFaColorVarSwatchStyle(name)"
                          aria-hidden="true"
                          :data-test-fa-theme-var-swatch="name"
                        />
                        <span
                          class="windowAppStyling__helpTooltipFaVarName"
                        >{{ name }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </q-menu>
            </q-icon>
            <div
              ref="editorHostRef"
              class="windowAppStyling__editorHost"
              data-test-locator="windowAppStyling-editorHost"
            />

            <div
              v-if="monaco.isLoading.value"
              class="windowAppStyling__loadingOverlay"
              data-test-locator="windowAppStyling-loadingOverlay"
            >
              <q-spinner-dots
                color="primary-bright"
                size="48px"
              />
              <span class="q-ml-md">{{ $t('floatingWindows.appStyling.loading') }}</span>
            </div>

            <div
              v-if="monaco.loadError.value !== null"
              class="windowAppStyling__loadError text-negative"
              data-test-locator="windowAppStyling-loadError"
            >
              {{ monaco.loadError.value }}
            </div>
          </q-card-section>

          <q-card-actions
            align="right"
            class="q-mb-sm q-mt-none q-px-md q-gutter-sm windowAppStyling__cardActions"
          >
            <q-btn
              flat
              color="accent"
              class="q-mr-xl"
              :label="$t('floatingWindows.appStyling.closeWithoutSaving')"
              data-test-locator="windowAppStyling-button-close"
              @click="closeWithoutSaving"
            />
            <q-btn
              color="primary-bright"
              outline
              :label="$t('floatingWindows.appStyling.saveButton')"
              data-test-locator="windowAppStyling-button-save"
              @click="saveAndCloseWindow"
            />
          </q-card-actions>
        </q-card>
      </div>
    </Transition>
  </FaFloatingWindowBodyTeleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import FaFloatingWindowBodyTeleport from 'app/src/components/floatingWindows/_FaFloatingWindowBodyTeleport/_FaFloatingWindowBodyTeleport.vue'
import FaFloatingWindowFrameResizeHandles from 'app/src/components/floatingWindows/_FaFloatingWindowFrameResizeHandles/_FaFloatingWindowFrameResizeHandles.vue'
import { getMonacoKeybindHelpItems } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStylingKeybindHelp'
import { useWindowAppStylingHelpMenu } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStylingHelpMenu'
import { useWindowAppStylingFramePersist } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/useWindowAppStylingFramePersist'
import { useWindowAppStyling } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStylingState'
import { buildFaColorVarSwatchStyle } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/faColorVarSwatchStyle'
import { getFaColorCustomPropertyNamesForHelpPanel } from 'app/src/scripts/faTheme/faThemeCustomPropertyNames'
import {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS
} from 'app/src/scripts/floatingWindows/faFloatingWindowPopTransition'
import { useFaFloatingWindowFrame } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFrame'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'

defineOptions({
  name: 'WindowAppStyling'
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
} = useWindowAppStyling(props)

const appStylingStore = S_FaAppStyling()
const persistedAppStylingFrame = computed(() => appStylingStore.root?.frame ?? null)

const {
  frameRef,
  frameStyle,
  h,
  onFramePointerDown,
  onResizePointerDown,
  onTitlePointerDown,
  titleShortFrameClass,
  w,
  x,
  y
} = useFaFloatingWindowFrame(windowModel, undefined, {
  persistedFrame: persistedAppStylingFrame
})

useWindowAppStylingFramePersist({
  h,
  w,
  windowModel,
  x,
  y
})

const {
  helpKeybindMenuOpen,
  onHelpIconMouseEnter,
  onHelpIconMouseLeave
} = useWindowAppStylingHelpMenu()

const frameStyleWithDialogTransition = computed(() => ({
  ...frameStyle.value,
  '--q-transition-duration': `${FA_FLOATING_WINDOW_POP_TRANSITION_MS}ms`
}))

/**
 * Reactive so the chord text re-evaluates if the keybinds snapshot lands while the window is open
 * (e.g. after the first 'S_FaKeybinds().refreshKeybinds()' resolves on app startup).
 */
const monacoKeybindHelpItems = computed(() => getMonacoKeybindHelpItems())

const faThemeCustomPropertyNames = ref<readonly string[]>(
  getFaColorCustomPropertyNamesForHelpPanel()
)

watch(helpKeybindMenuOpen, (open) => {
  if (open) {
    void nextTick(() => {
      faThemeCustomPropertyNames.value = getFaColorCustomPropertyNamesForHelpPanel()
    })
  }
})
</script>

<style lang="scss" src="./styles/WindowAppStyling.unscoped.scss"></style>
