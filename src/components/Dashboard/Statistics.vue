<template>
  <v-container :fluid="isCurrentUserAdmin()">
    <v-row>
      <v-col v-if="isCurrentUserAdmin()" cols="12" :lg="isCurrentUserAdmin() ? '4' : '6'">
        <Card v-bind="usersCard" :count="usersCount" />
      </v-col>
      <v-col cols="12" :lg="isCurrentUserAdmin() ? '4' : '6'">
        <Card v-bind="pvsCard" :count="pvsCount"/>
      </v-col>
      <v-col cols="12" :lg="isCurrentUserAdmin() ? '4' : '6'">
        <Card v-bind="experimentsCard" :count="expCount"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Card from './Card.vue';
export default {
  components: { 
    Card 
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  watch: {
    user(val) {
      console.log('user changed!')   
      if (val.user_type === 'Admin') {
        this.getAllUsersCount()  
        this.getAllPVsCount()
        this.getAllExperimentsCount()
      } else {
        this.getUserExperimentsCount()
        this.getUserPVsCount()
      }
    },
  },
  data: () => ({
    usersCount: 0,
    pvsCount: 0,
    expCount: 0
  }),
  computed: {
    usersCard() {
      return {
        title: this.$General.GetString('userscount'),
        buttonText: this.$General.GetString('manageusers'),
        buttonLink: '/users',
        buttonColor: 'info',
        icon: 'mdi-account-group'
      }
    },
    pvsCard() {
      return {
        title: this.$General.GetString('pvscount'),
        buttonText: this.$General.GetString('managePVs'),
        buttonLink: '/pvs',
        buttonColor: 'success',
        icon: 'mdi-file-chart-outline'
      }
    },
    experimentsCard() {
      return {
        title: this.$General.GetString('experimentscount'),
        buttonText: this.$General.GetString('manageExperiments'),
        buttonLink: '/experiments',
        buttonColor: 'warning',
        icon: 'mdi-camera-document'
      }
    },
  },
  methods: {
    isCurrentUserAdmin() {
      return this.user.userType === 'Admin'
    },
    getAllUsersCount() {
      this.$Axios
        .get(this.$General.APIUsers(), this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
        .then(({data}) => {
          this.usersCount = data.users.length;
        })
        .catch(e => console.log(e))
    },
    getAllPVsCount() {
      this.$Axios
        .get(this.$General.APIPVs(), this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
        .then(({data}) => {
          this.pvsCount = data.process_variables.length;
        })
        .catch(e => console.log(e))
    },
    getAllExperimentsCount() {
      this.$Axios
        .get(this.$General.APIExperiments(), this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
        .then(({data}) => {
          console.log(data)
          this.expCount = data.experiments.length;
        })
        .catch(e => console.log(e))
    },
    getUserExperimentsCount() {
      this.expCount = this.user.experiment_urls?.length
    },
    getUserPVsCount() {
      if (this.user.experiment_urls) {
        Promise.all(
          this.user.experiment_urls.map(url => this.$Axios.get(this.$General.MainDomain + url, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))))
          .then(resArray => {
            resArray.forEach(({data}) => {
              this.pvsCount += data.experiment.process_variable_urls.length
            })
          })
          .catch(e => console.log(e))
      }
    }
  },
  mounted() {
    if (this.isCurrentUserAdmin()) {
      this.getAllUsersCount()  
      this.getAllPVsCount()
      this.getAllExperimentsCount()
    } else {
      this.getUserExperimentsCount()
      this.getUserPVsCount()
    }
  },
};
</script>
