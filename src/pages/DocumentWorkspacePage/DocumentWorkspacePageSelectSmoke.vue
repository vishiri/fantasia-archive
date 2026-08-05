<template>
  <div
    v-if="documentTab !== null"
    class="documentWorkspacePage__selectSmoke q-mt-md"
    data-test-locator="documentWorkspacePage-selectSmoke"
  >
    <div class="documentWorkspacePage__field dialogProjectSettings__field q-mb-md">
      <div class="documentWorkspacePage__fieldTitle">
        <span
          class="documentWorkspacePage__fieldLabel fa-text-label text-body2"
          data-test-locator="documentWorkspacePage-selectSmokeMultiSimpleLabel"
        >
          FaSelectInput multi smoke - Simple
        </span>
      </div>
      <FaSelectInput
        v-model="smokeMultiSimpleModel"
        :disable="disable"
        mode="simple"
        multiple
        :options="smokeSimpleOptions"
        test-locator="documentWorkspacePage-selectSmokeMultiSimple"
      />
    </div>

    <div class="documentWorkspacePage__field dialogProjectSettings__field q-mb-md">
      <div class="documentWorkspacePage__fieldTitle">
        <span
          class="documentWorkspacePage__fieldLabel fa-text-label text-body2"
          data-test-locator="documentWorkspacePage-selectSmokeSingleSimpleLabel"
        >
          FaSelectInput single smoke - Simple
        </span>
      </div>
      <FaSelectInput
        v-model="smokeSingleSimpleModel"
        :disable="disable"
        mode="simple"
        :options="smokeSimpleOptions"
        test-locator="documentWorkspacePage-selectSmokeSingleSimple"
      />
    </div>

    <div class="documentWorkspacePage__field dialogProjectSettings__field q-mb-md">
      <div class="documentWorkspacePage__fieldTitle">
        <span
          class="documentWorkspacePage__fieldLabel fa-text-label text-body2"
          data-test-locator="documentWorkspacePage-selectSmokeMultiTemplateLabel"
        >
          FaSelectInput multi smoke - Document templates
        </span>
      </div>
      <FaSelectInput
        v-model="smokeMultiTemplateModel"
        :disable="disable"
        :loading="isProjectOptionsLoading"
        mode="otherType"
        multiple
        :options="smokeTemplateOptions"
        test-locator="documentWorkspacePage-selectSmokeMultiTemplate"
        @request-options="loadProjectSmokeOptions"
      />
    </div>

    <div class="documentWorkspacePage__field dialogProjectSettings__field q-mb-md">
      <div class="documentWorkspacePage__fieldTitle">
        <span
          class="documentWorkspacePage__fieldLabel fa-text-label text-body2"
          data-test-locator="documentWorkspacePage-selectSmokeSingleTemplateLabel"
        >
          FaSelectInput single smoke - Document templates
        </span>
      </div>
      <FaSelectInput
        v-model="smokeSingleTemplateModel"
        :disable="disable"
        :loading="isProjectOptionsLoading"
        mode="otherType"
        :options="smokeTemplateOptions"
        test-locator="documentWorkspacePage-selectSmokeSingleTemplate"
        @request-options="loadProjectSmokeOptions"
      />
    </div>

    <div class="documentWorkspacePage__field dialogProjectSettings__field q-mb-md">
      <div class="documentWorkspacePage__fieldTitle">
        <span
          class="documentWorkspacePage__fieldLabel fa-text-label text-body2"
          data-test-locator="documentWorkspacePage-selectSmokeMultiDocumentLabel"
        >
          FaSelectInput multi smoke - Documents
        </span>
      </div>
      <FaSelectInput
        v-model="smokeMultiDocumentModel"
        :disable="disable"
        :loading="isProjectOptionsLoading"
        mode="document"
        multiple
        :options="smokeDocumentOptions"
        test-locator="documentWorkspacePage-selectSmokeMultiDocument"
        @request-options="loadProjectSmokeOptions"
      />
    </div>

    <div class="documentWorkspacePage__field dialogProjectSettings__field">
      <div class="documentWorkspacePage__fieldTitle">
        <span
          class="documentWorkspacePage__fieldLabel fa-text-label text-body2"
          data-test-locator="documentWorkspacePage-selectSmokeSingleDocumentLabel"
        >
          FaSelectInput single smoke - Documents
        </span>
      </div>
      <FaSelectInput
        v-model="smokeSingleDocumentModel"
        :disable="disable"
        :loading="isProjectOptionsLoading"
        mode="document"
        :options="smokeDocumentOptions"
        test-locator="documentWorkspacePage-selectSmokeSingleDocument"
        @request-options="loadProjectSmokeOptions"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faSelectInputObjectItem } from 'app/types/I_faSelectInput'

import FaSelectInput from 'app/src/components/elements/FaSelectInput/FaSelectInput.vue'

import {
  mapDocumentWorkspacePageSelectSmokeDocumentOptions,
  mapDocumentWorkspacePageSelectSmokeTemplateOptions
} from './scripts/functions/mapDocumentWorkspacePageSelectSmokeOptions'

defineOptions({
  name: 'DocumentWorkspacePageSelectSmoke'
})

const props = defineProps<{
  disable: boolean
  documentTab: I_faOpenedDocumentTab | null
}>()

const smokeSimpleOptions = [
  'test 1',
  'test 2',
  'test 3',
  'test 4',
  'test 5',
  'test 6',
  'test 7',
  'test 8',
  'test 9',
  'test 10'
] as const

const smokeMultiSimpleModel = ref<string[]>([])
const smokeSingleSimpleModel = ref('')
const smokeMultiTemplateModel = ref<I_faSelectInputObjectItem[]>([])
const smokeSingleTemplateModel = ref<I_faSelectInputObjectItem | null>(null)
const smokeMultiDocumentModel = ref<I_faSelectInputObjectItem[]>([])
const smokeSingleDocumentModel = ref<I_faSelectInputObjectItem | null>(null)
const smokeTemplateOptions = ref<I_faSelectInputObjectItem[]>([])
const smokeDocumentOptions = ref<I_faSelectInputObjectItem[]>([])
const isProjectOptionsLoading = ref(false)

async function loadProjectSmokeOptions (): Promise<void> {
  if (props.documentTab === null) {
    return
  }

  const projectContent = window.faContentBridgeAPIs?.projectContent
  if (projectContent === undefined) {
    smokeTemplateOptions.value = []
    smokeDocumentOptions.value = []
    return
  }

  isProjectOptionsLoading.value = true
  try {
    const [templatesResult, documentsResult] = await Promise.all([
      projectContent.listDocumentTemplates(),
      projectContent.listDocuments()
    ])
    const templates = templatesResult.items
    smokeTemplateOptions.value = mapDocumentWorkspacePageSelectSmokeTemplateOptions(templates)

    const templateIconById = new Map<string, string>()
    for (const template of templates) {
      if (template.icon.length > 0) {
        templateIconById.set(template.id, template.icon)
      }
    }
    smokeDocumentOptions.value = mapDocumentWorkspacePageSelectSmokeDocumentOptions(
      documentsResult.items,
      templateIconById
    )
  } catch {
    smokeTemplateOptions.value = []
    smokeDocumentOptions.value = []
  } finally {
    isProjectOptionsLoading.value = false
  }
}

onMounted(() => {
  void loadProjectSmokeOptions()
})

watch(
  () => props.documentTab?.documentId,
  () => {
    void loadProjectSmokeOptions()
  }
)
</script>
