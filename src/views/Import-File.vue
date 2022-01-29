<template>
  <v-container>
    <ImportConfig />
    <ExportConfig />
  </v-container>
</template>

<script>
import ImportConfig from '../components/file/import-config.vue'
import ExportConfig from '../components/file/export-config.vue'
export default {
  components: {
    ImportConfig,
    ExportConfig
  }
}
</script>