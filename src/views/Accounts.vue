<template>
  <v-container fluid>
    <UserTable :users="users" @reload-users="getUsers"></UserTable>
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
