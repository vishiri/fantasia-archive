import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaFloatingWindowFrameResizeHandles from '../_FaFloatingWindowFrameResizeHandles.vue'

const meta = {
  component: FaFloatingWindowFrameResizeHandles,
  parameters: {
    docs: {
      disable: true
    },
    layout: 'fullscreen'
  },
  tags: ['skip-visual'],
  title: 'Components/floatingWindows/_FaFloatingWindowFrameResizeHandles'
} satisfies Meta<typeof FaFloatingWindowFrameResizeHandles>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      FaFloatingWindowFrameResizeHandles
    },
    methods: {
      onResizePointerDown (): void {}
    },
    template: `
      <div
        class="relative-position bg-dark"
        style="width: 480px; height: 320px; margin: 24px auto;"
      >
        <FaFloatingWindowFrameResizeHandles :on-resize-pointer-down="onResizePointerDown" />
      </div>
    `
  })
}
