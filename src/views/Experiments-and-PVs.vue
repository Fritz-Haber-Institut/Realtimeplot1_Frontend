<template>
  <v-container fluid>
    <!-- <PVsform :user="this.$props.user" /> -->
    <v-tabs v-model="tab">
      <v-tab @change="getExperiments">Experiments</v-tab>
      <v-tab @change="getPVs">PVs</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item transition="fade-transition">
        <Experiments :experiments="experiments" @reload-experiments="getExperiments" />
      </v-tab-item>
      <v-tab-item transition="fade-transition">
        <PVs :pvs="pvs" @reload-pvs="getPVs" />
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
      experiments: [],
      pvs: []
    }
  },
  methods: {
    getExperiments() {
      this.$Axios
      .get(this.$General.APIExperiments(), this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
      .then(res => {
        // console.log(res.data)
        this.experiments = this.transformFetchedData('exp', res.data.experiments)
        console.log('Experiments-and-PVs: experiments:')
        console.log(this.experiments)
      })
      .catch(e => {
        console.log(e)
      })
    },
    getPVs() {
      this.$Axios
      .get(this.$General.APIPVs(), this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
      .then(res => {
        // console.log(res.data)
        this.pvs = this.transformFetchedData('pv', res.data.process_variables)
      })
      .catch(e => {
        console.log(e)
      })
    },
    transformFetchedData(type, data) {
      return type === 'exp' ?
        data.map(exp => {
          return {
            short_id: exp['short_id'],
            name: exp['human_readable_name'],
            pvsUrls: exp['process_variable_urls'],
            pvs: exp['process_variable_urls'].map(pvUrl => pvUrl.split('pvs/')[1]),
            userUrls: exp['user_urls'],
            users: exp['user_urls'].map(userUrl => userUrl.split('users/')[1])
          }
        })
        :
        data.map(pv => {
          return {
            pv_string: pv['pv_string'],
            name: pv['human_readable_name'],
            experimentId: pv['experiment_short_id']
          }
        })
    },
  },
  mounted() {
    this.getExperiments()
    this.getPVs()
  }
}
</script>
<style>
  .DialogLink {
    text-decoration: underline;
    /* text-decoration-color: blue; */
    cursor: pointer;
  }
</style>