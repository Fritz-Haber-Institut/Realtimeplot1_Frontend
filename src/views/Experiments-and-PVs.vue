<template>
  <v-container>
    <!-- <v-tabs v-model="tab">
      <v-tab to="/experiments" @change="markActiveTab('exp')">Experiments</v-tab>
      <v-tab to="/pvs" @change="markActiveTab('pvs')">PVs</v-tab>
    </v-tabs> -->
    <!-- <v-tabs-items v-model="tab">
      <v-tab-item transition="fade-transition">
        <Experiments :user="user" :hasActiveTab="activeTab === 'exp'" @switch-to-pv-tab="switchTabForcibly" />
      </v-tab-item>
      <v-tab-item transition="fade-transition">
        <PVs :user="user" :hasActiveTab="activeTab === 'pvs'" :shouldOpenCreateDialog="shouldOpenCreatePVDialog" @dialog-opened="openDialogCompleted" />
      </v-tab-item>
    </v-tabs-items> -->
    <!-- <router-view></router-view> -->
    <Experiments v-if="$route.path === '/experiments'" @switch-to-pv-tab="switchTabForcibly" />
    <!-- <transition name="fade">
    </transition> -->
    <PVs v-if="$route.path === '/pvs'" :shouldOpenCreateDialog="shouldOpenCreatePVDialog" @dialog-opened="openDialogCompleted" />
    <!-- <transition name="fade">
    </transition> -->

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
  props: {
    shouldOpenCreatePVDialog: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    switchTabForcibly() {
      console.log('Emitting from the view')  
      this.$emit('switch-tab')
    },
    openDialogCompleted() {
      this.$emit('create-dialog-open')
    },
  }
};
</script>
<style>
.DialogLink {
  text-decoration: underline;
  cursor: pointer;
}
</style>