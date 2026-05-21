<template>
  <div class="_faModalAndFloatingWindowHost">
    <DialogMarkdownDocument />
    <DialogAboutFantasiaArchive />
    <DialogActionMonitor />
    <DialogKeybindSettings />
    <DialogAppSettings />
    <WindowAppStyling />
    <WindowProjectStyling />
    <WindowAppNoteboard />
    <WindowProjectNoteboard />
    <DialogImportExportAppConfig />
    <DialogNewProject />
  </div>
</template>

<script setup lang="ts">
import DialogMarkdownDocument from 'app/src/components/dialogs/DialogMarkdownDocument/DialogMarkdownDocument.vue'
import DialogNewProject from 'app/src/components/dialogs/DialogNewProject/DialogNewProject.vue'
import DialogAboutFantasiaArchive from 'app/src/components/dialogs/DialogAboutFantasiaArchive/DialogAboutFantasiaArchive.vue'
import DialogActionMonitor from 'app/src/components/dialogs/DialogActionMonitor/DialogActionMonitor.vue'
import DialogKeybindSettings from 'app/src/components/dialogs/DialogKeybindSettings/DialogKeybindSettings.vue'
import DialogAppSettings from 'app/src/components/dialogs/DialogAppSettings/DialogAppSettings.vue'
import DialogImportExportAppConfig from 'app/src/components/dialogs/DialogImportExportAppConfig/DialogImportExportAppConfig.vue'
import WindowAppNoteboard from 'app/src/components/floatingWindows/WindowAppNoteboard/WindowAppNoteboard.vue'
import WindowProjectNoteboard from 'app/src/components/floatingWindows/WindowProjectNoteboard/WindowProjectNoteboard.vue'
import WindowAppStyling from 'app/src/components/floatingWindows/WindowAppStyling/WindowAppStyling.vue'
import WindowProjectStyling from 'app/src/components/floatingWindows/WindowProjectStyling/WindowProjectStyling.vue'

defineOptions({
  name: '_FaModalAndFloatingWindowHost'
})
</script>

<style lang="scss" scoped>
._faModalAndFloatingWindowHost {
  display: contents;
}
</style>
