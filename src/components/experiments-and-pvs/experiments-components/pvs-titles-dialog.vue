<template>
  <v-dialog :max-width="$vuetify.breakpoint.smOnly ? '60%' : '100%'">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon class="elevation-4 white" v-bind="attrs" v-on="on">
        <v-icon>mdi-chart-line</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>Process variables</v-card-title>
      <v-card-subtitle v-show="subtitleVisible" class="mt-2">Click on one of the PVs to view its visualizations</v-card-subtitle>
      <v-card-text>
        <PVsTitles :pvsUrls="pvsUrls" :currentUserExperiments="currentUserExperiments" @logged-user-assigned="toggleSubtitles"/>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import PVsTitles from './pvs-titles-exp-table.vue'
export default {
  components: {
    PVsTitles
  },
  props: {
    pvsUrls: {
      type: Array,
      required: true
    },
    currentUserExperiments: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      subtitleVisible: false
    }
  },
  methods: {
    toggleSubtitles(isCurrentUserLoggedIn) {
      this.subtitleVisible = isCurrentUserLoggedIn
    }
  }
}
</script>

<style>

</style>