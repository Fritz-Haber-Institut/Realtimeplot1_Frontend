<template>
  <v-container fluid>
    <v-tabs v-model="tab">
      <v-tab @change="markActiveTab('exp')">Experiments</v-tab>
      <v-tab @change="markActiveTab('pvs')">PVs</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item transition="fade-transition">
        <Experiments :hasActiveTab="activeTab === 'exp'" @switch-to-pv-tab="switchTabForcibly" />
      </v-tab-item>
      <v-tab-item transition="fade-transition">
        <PVs :hasActiveTab="activeTab === 'pvs'" :shouldOpenCreateDialog="shouldOpenCreatePVDialog" @dialog-opened="openDialogCompleted" />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import Experiments from '../components/experiments-and-pvs/experiments.vue';
import PVs from '../components/experiments-and-pvs/PVs.vue'

export default {
  components: {
    Experiments,
    PVs,
  },
  data() {
    return {
      tab: null,
      activeTab: 'exp',
      shouldOpenCreatePVDialog: false
    }
  },
  methods: {
    markActiveTab(kind) {
      this.activeTab = kind
    },
    switchTabForcibly() {
      this.tab = 1 - this.tab
      this.shouldOpenCreatePVDialog = true
      this.markActiveTab('pvs')
    },
    openDialogCompleted() {
      this.shouldOpenCreatePVDialog = false
    }
  }
}
</script>
<style>
  .DialogLink {
    text-decoration: underline;
    cursor: pointer;
  }
</style>