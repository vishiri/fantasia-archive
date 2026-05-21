<template>
  <q-page
    class="errorNotFoundPage flex flex-center column text-center q-pa-md bg-dark text-primary"
    data-test-locator="errorNotFoundPage"
  >
    <ErrorCard
      :title="$t('errorNotFound.title')"
      :details="errorCardDetails"
      image-name="error"
    />

    <div class="errorNotFoundPage__actions column items-center">
      <q-btn
        v-if="showResumeCurrentProject"
        class="errorNotFoundPage__resumeBtn q-mt-xl text-uppercase"
        color="primary"
        data-test-locator="errorNotFound-btn-resume-current"
        outline
        size="lg"
        type="button"
        :label="$t('errorNotFound.resumeCurrentProject')"
        @click="onResumeCurrentProjectClick"
      />
      <q-btn
        :class="returnButtonMarginClass"
        color="primary"
        data-test-locator="errorNotFound-btn-return-to-start"
        outline
        size="lg"
        to="/"
      >
        {{ $t('errorNotFound.ctaText') }}
      </q-btn>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'

import { errorNotFoundResumeCurrentProjectClick } from 'app/src/pages/scripts/errorNotFoundResumeCurrentProject'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import ErrorCard from 'src/components/elements/ErrorCard/ErrorCard.vue'

defineOptions({
  name: 'ErrorNotFound'
})

const activeProjectStore = S_FaActiveProject()
const { activeProject, hasActiveProject } = storeToRefs(activeProjectStore)

const errorCardDetails = computed(() =>
  `${i18n.global.t('errorNotFound.subTitleFirst')}\n${i18n.global.t('errorNotFound.subTitleSecond')}`
)

const showResumeCurrentProject = computed(() => {
  if (hasActiveProject.value !== true) {
    return false
  }

  const filePath = activeProject.value?.filePath ?? ''
  return filePath.trim().length > 0
})

const returnButtonMarginClass = computed(() => {
  if (showResumeCurrentProject.value === true) {
    return 'q-mt-lg'
  }

  return 'q-mt-xl'
})

function onResumeCurrentProjectClick (): void {
  errorNotFoundResumeCurrentProjectClick(activeProject.value?.filePath)
}
</script>

<style scoped lang="scss">
.errorNotFoundPage {
  min-height: inherit;
}
</style>
