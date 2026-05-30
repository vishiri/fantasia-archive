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
import ErrorCard from 'app/src/components/elements/ErrorCard/ErrorCard.vue'

import { useErrorNotFound } from './scripts/errorNotFound_manager'

defineOptions({
  name: 'ErrorNotFound'
})

const {
  errorCardDetails,
  onResumeCurrentProjectClick,
  returnButtonMarginClass,
  showResumeCurrentProject
} = useErrorNotFound()
</script>

<style scoped lang="scss">
.errorNotFoundPage {
  min-height: inherit;
}
</style>
