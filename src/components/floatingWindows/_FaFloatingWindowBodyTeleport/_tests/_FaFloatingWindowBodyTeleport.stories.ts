import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaFloatingWindowBodyTeleport from '../_FaFloatingWindowBodyTeleport.vue'

const meta = {
  component: FaFloatingWindowBodyTeleport,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/floatingWindows/_FaFloatingWindowBodyTeleport'
} satisfies Meta<typeof FaFloatingWindowBodyTeleport>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      FaFloatingWindowBodyTeleport
    },
    template: `
      <FaFloatingWindowBodyTeleport>
        <div
          class="bg-dark text-white q-pa-md"
          data-test-locator="fa-floating-window-teleport-preview"
        >
          Teleported floating-window body slot
        </div>
      </FaFloatingWindowBodyTeleport>
    `
  })
}
