<template>
  <v-container fluid>
    <Statistics :user="currentUser" />
    <Import-File v-if="currentUser.user_type === 'Admin'" style="width:60%" />    
  </v-container>
</template>

<script>
import Statistics from '../components/Dashboard/Statistics.vue';
import ImportFile from '../components/Dashboard/Import-File.vue';

export default {
  components: {
    Statistics,
    ImportFile,
  },
  data() {
    return {
      currentUser: {}
    }
  },
  methods: {
    getCurrentUser() {
      this.$Axios
      .get(this.$General.APIUsers() + '/current', this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
      .then(({data}) => this.currentUser = data.user)
      .catch(e => console.log(e))
    }
  },
  mounted() {
    this.getCurrentUser()
  },
};
</script>
