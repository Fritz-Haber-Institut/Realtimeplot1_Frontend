<template>
  <v-container fluid>
    <v-tabs v-model="tab">
      <v-tab @change="setActiveTab('exp')">Experiments</v-tab>
      <v-tab @change="setActiveTab('pvs')">PVs</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item transition="fade-transition">
        <Experiments :hasActiveTab="activeTab === 'exp'" />
      </v-tab-item>
      <v-tab-item transition="fade-transition">
        <PVs :hasActiveTab="activeTab === 'pvs'" />
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
      activeTab: 'exp'
    }
  },
  methods: {
    setActiveTab(kind) {
      this.activeTab = kind
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