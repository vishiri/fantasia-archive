<template>
  <q-item
    v-bind="boundItemProps"
    :class="{
      'faSelectInput__option--separatorAlt': index > 0
    }"
    :data-test-locator="`${testLocator}-option-${index}`"
    :data-test-locator-separator-alt="index > 0
      ? `${testLocator}-separatorAlt-${index}`
      : undefined"
    @auxclick="emit('option-auxclick', $event)"
    @keydown.enter="onOptionEnterKeydown"
  >
    <q-item-section
      v-if="iconName !== null"
      avatar
    >
      <q-icon
        :class="[
          'faSelectInput__optionIcon',
          iconClass
        ]"
        :name="iconName"
        :style="iconStyle ?? undefined"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label>
        <span
          v-for="(segment, segmentIndex) in labelSegments"
          :key="`${segmentIndex}-${segment.text}`"
          :class="{
            faSelectInput__optionMatch: segment.isMatch
          }"
        >{{ segment.text }}</span>
      </q-item-label>
    </q-item-section>
    <q-item-section
      v-if="$slots['option-trailing']"
      side
    >
      <slot name="option-trailing" />
    </q-item-section>
    <slot name="option-context-menu" />
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { I_faColorGlyphCssCustomProperties } from 'app/types/I_faColorContrast'
import type { T_faSelectInputOption } from 'app/types/I_faSelectInput'

import {
  bindFaSelectInputOptionItemActivateProps,
  shouldActivateFaSelectInputOnEnter
} from './scripts/faSelectInput_manager'

defineOptions({
  name: 'FaSelectInputOptionItem'
})

const props = withDefaults(defineProps<{
  activateOnly?: boolean
  iconClass: string | undefined
  iconName: string | null
  iconStyle: I_faColorGlyphCssCustomProperties | null
  index: number
  itemProps: Record<string, unknown>
  labelSegments: readonly { isMatch: boolean, text: string }[]
  opt: T_faSelectInputOption
  testLocator: string
}>(), {
  activateOnly: false
})

const emit = defineEmits<{
  'option-activate': [value: T_faSelectInputOption]
  'option-auxclick': [event: MouseEvent]
}>()

const onActivate = (): void => {
  emit('option-activate', props.opt)
}

const boundItemProps = computed(() => {
  return bindFaSelectInputOptionItemActivateProps(
    props.itemProps,
    onActivate,
    { skipQuasarSelect: props.activateOnly }
  )
})

/**
 * Portaled option rows: Enter must activate even when Quasar never focuses the filter input.
 */
function onOptionEnterKeydown (event: KeyboardEvent): void {
  if (!shouldActivateFaSelectInputOnEnter(event)) {
    return
  }
  boundItemProps.value.onKeydown(event)
}
</script>
