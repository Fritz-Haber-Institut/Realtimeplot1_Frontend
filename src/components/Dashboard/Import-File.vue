<template>
  <v-container>
    <v-divider class="my-1" />
    <div class="my-4">
      <h2 class="text-center my-1">{{ $General.GetString('importconfigtitle') }}</h2>
      <h4 class="text-center my-1">{{ $General.GetString('importconfigdesc') }}</h4>
    </div>
    <ImportConfig />
    <ExportConfig />
  </v-container>
</template>

<script>
import ImportConfig from '../file/import-config.vue';
import ExportConfig from '../file/export-config.vue';
export default {
  components: {
    ImportConfig,
    ExportConfig,
  },
};
</script>