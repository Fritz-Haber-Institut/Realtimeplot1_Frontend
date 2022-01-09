<template>
  <v-container fluid>
    <v-card class="pa-5"> Accounts </v-card>
    <user-table :users="users" @reload-users="getUsers"></user-table>
  </v-container>
</template>

<script>
import UserTable from '../components/UserTable.vue'

export default {
  components: {
    UserTable
  },
  data() {
    return {
      users: []
    }
  },
  methods: {
    getUsers() {
      this.$Axios
      .get(this.$General.APIUsers(), this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
      .then(res => {
        // console.log(res.data)
        this.users = res.data.users
      })
      .catch(e => {
        console.log(e)
      })
    }
  },
  mounted() {
    this.getUsers()
  }
};
</script>
