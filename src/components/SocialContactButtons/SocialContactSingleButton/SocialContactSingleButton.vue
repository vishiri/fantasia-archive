<template>
  <q-btn
    :class="['socialContactSingleButton', buttonData.cssClass]"
    :title="buttonData.title"
    :href="buttonData.url"
  >
    <div class="row items-center no-wrap">
      <q-img
        :src="buttonData.url"
        fit="contain"
        :width="`${buttonData.width}px`"
        :height="`${buttonData.height}px`"
      />
      <div class="text-no-wrap">
        {{ buttonData.label }}
      </div>
    </div>
  </q-btn>
</template>

<script setup lang="ts">
import { I_socialContactButton } from 'app/types/I_socialContactButtons'

/**
 * All component props
 */
const props = defineProps<{
  buttonData: I_socialContactButton
}>()

</script>

<style lang="scss" scoped>

.socialContactSingleButton {
}

</style>
