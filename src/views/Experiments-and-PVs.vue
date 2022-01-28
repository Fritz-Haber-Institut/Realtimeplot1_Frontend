<template>
  <v-container fluid>
    <v-tabs v-model="tab">
      <v-tab href="#exp" @change="markActiveTab('exp')">Experiments</v-tab>
      <v-tab href="#pvs" @change="markActiveTab('pvs')">PVs</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item transition="fade-transition" value="exp">
        <Experiments :hasActiveTab="activeTab === 'exp'" @switch-to-pv-tab="switchTabForcibly" />
      </v-tab-item>
      <v-tab-item transition="fade-transition" value="pvs">
        <PVs :hasActiveTab="activeTab === 'pvs'" :shouldOpenCreateDialog="shouldOpenCreatePVDialog" @dialog-opened="openDialogCompleted" />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import Experiments from '../components/experiments-and-pvs/experiments.vue';
import PVs from '../components/experiments-and-pvs/PVs.vue';

export default {
  components: {
    Experiments,
    PVs,
  },
  data() {
    return {
      tabs: null,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      tab: null,
      activeTab: 'pvs',
      shouldOpenCreatePVDialog: false,
    };
  },
  methods: {
    markActiveTab(kind) {
      this.activeTab = kind;
    },
    switchTabForcibly() {
      this.tab = 1 - this.tab;
      this.shouldOpenCreatePVDialog = true;
      this.markActiveTab('pvs');
    },
    openDialogCompleted() {
      this.shouldOpenCreatePVDialog = false;
    },
  },
};
</script>
<style>
.DialogLink {
  cursor: pointer;
}
</style>