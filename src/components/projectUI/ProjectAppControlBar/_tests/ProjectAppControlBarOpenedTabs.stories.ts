import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { App } from 'vue'
import { getCurrentInstance, onMounted, ref } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { createFaOpenedDocumentTabStoryFixture } from '../../../../../.storybook-workspace/.storybook/fixtures/createFaOpenedDocumentTabStoryFixture'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  resolveProjectAppControlBarTabAppearanceChrome,
  resolveProjectAppControlBarTabInlineStyle
} from '../scripts/projectAppControlBarTabAppearanceChromeWiring'
import ProjectAppControlBarOpenedTabs from '../ProjectAppControlBarOpenedTabs.vue'

const sampleTabs = [
  createFaOpenedDocumentTabStoryFixture({
    documentId: 'doc-hero',
    displayNameDraft: 'Hero',
    savedDisplayName: 'Hero',
    hasUnsavedChanges: true
  }),
  createFaOpenedDocumentTabStoryFixture({
    documentId: 'doc-villain',
    displayNameDraft: 'Villain draft',
    savedDisplayName: 'Villain',
    templateIcon: 'mdi-skull',
    hasUnsavedChanges: true
  })
]

function resolveStoryRouter (app: App): Router {
  const globalProperties = app.config.globalProperties
  if (globalProperties.$router == null) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/home/document/:documentId',
          component: {
            template: '<div />'
          }
        },
        {
          path: '/:pathMatch(.*)*',
          component: {
            template: '<div />'
          }
        }
      ]
    })
    app.use(router)
    return router
  }
  return globalProperties.$router as Router
}

const meta = {
  component: ProjectAppControlBarOpenedTabs,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarOpenedTabs'
} satisfies Meta<typeof ProjectAppControlBarOpenedTabs>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      ProjectAppControlBarOpenedTabs
    },
    setup () {
      const ready = ref(false)

      onMounted(() => {
        const instance = getCurrentInstance()
        if (instance == null) {
          return
        }
        const router = resolveStoryRouter(instance.appContext.app)
        void router.replace('/home/document/doc-hero').then(() => {
          ready.value = true
        })
      })

      return {
        activeDocumentTabName: 'doc-hero',
        hideTabCloseButton: false,
        moveDocumentTabLeftKeybindLabel: 'Ctrl+Left',
        moveDocumentTabRightKeybindLabel: 'Ctrl+Right',
        onTabAddNewDocumentUnderThisClick: async () => undefined,
        onTabAuxClick: () => {},
        onTabCloseAllWithoutChangesClick: () => {},
        onTabCloseAllWithoutChangesExceptClick: () => {},
        onTabCloseClick: () => {},
        onTabCopyBackgroundColorClick: async () => undefined,
        onTabCopyDocumentClick: async () => undefined,
        onTabCopyNameClick: async () => undefined,
        onTabCopyTextColorClick: async () => undefined,
        onTabDeleteClick: () => {},
        onTabForceCloseAllClick: () => {},
        onTabForceCloseAllExceptClick: () => {},
        onTabMoveClick: () => {},
        onTabReorder: () => {},
        openedDocumentTabs: sampleTabs,
        ready,
        resolveDocumentTabAppearanceChrome: resolveProjectAppControlBarTabAppearanceChrome,
        resolveDocumentTabDisplayIcon: (tab: I_faOpenedDocumentTab) => tab.templateIcon,
        resolveDocumentTabInlineStyle: resolveProjectAppControlBarTabInlineStyle,
        resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => tab.displayNameDraft,
        resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
        resolveTabWorldIndicatorColor: () => '#4caf50',
        showDocumentTabs: true,
        showTabBarScrollButtons: false,
        showWorldTabIndicators: true
      }
    },
    template: `
      <div style="min-height: 80px; padding: 1rem; background: #1d1d1d;">
        <ProjectAppControlBarOpenedTabs
          v-if="ready"
          :active-document-tab-name="activeDocumentTabName"
          :hide-tab-close-button="hideTabCloseButton"
          :move-document-tab-left-keybind-label="moveDocumentTabLeftKeybindLabel"
          :move-document-tab-right-keybind-label="moveDocumentTabRightKeybindLabel"
          :on-tab-add-new-document-under-this-click="onTabAddNewDocumentUnderThisClick"
          :on-tab-aux-click="onTabAuxClick"
          :on-tab-close-all-without-changes-click="onTabCloseAllWithoutChangesClick"
          :on-tab-close-all-without-changes-except-click="onTabCloseAllWithoutChangesExceptClick"
          :on-tab-close-click="onTabCloseClick"
          :on-tab-copy-background-color-click="onTabCopyBackgroundColorClick"
          :on-tab-copy-document-click="onTabCopyDocumentClick"
          :on-tab-copy-name-click="onTabCopyNameClick"
          :on-tab-copy-text-color-click="onTabCopyTextColorClick"
          :on-tab-delete-click="onTabDeleteClick"
          :on-tab-force-close-all-click="onTabForceCloseAllClick"
          :on-tab-force-close-all-except-click="onTabForceCloseAllExceptClick"
          :on-tab-move-click="onTabMoveClick"
          :on-tab-reorder="onTabReorder"
          :opened-document-tabs="openedDocumentTabs"
          :resolve-document-tab-appearance-chrome="resolveDocumentTabAppearanceChrome"
          :resolve-document-tab-display-icon="resolveDocumentTabDisplayIcon"
          :resolve-document-tab-inline-style="resolveDocumentTabInlineStyle"
          :resolve-document-tab-label="resolveDocumentTabLabel"
          :resolve-document-tab-route="resolveDocumentTabRoute"
          :resolve-tab-world-indicator-color="resolveTabWorldIndicatorColor"
          :show-document-tabs="showDocumentTabs"
          :show-tab-bar-scroll-buttons="showTabBarScrollButtons"
          :show-world-tab-indicators="showWorldTabIndicators"
        />
      </div>
    `
  })
}
