<template>
  <td :colspan="tdColspan" class="pt-3">
    <span v-for="(_, idx) in userUrls" :key="idx">
      <v-chip v-if="finishedLoading" class="mr-2 mb-2" color="primary">
        <v-icon left>mdi-account-circle-outline</v-icon>
        {{ usersFullNames[idx] }}
      </v-chip>
      <v-skeleton-loader v-else class="mr-2 mb-2 d-inline-block" type="chip" />
    </span>
  </td>
</template>

<script>
export default {
  props: {
    userUrls: {
      type: Array,
      required: true
    },
    tdColspan: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      usersFullNames: [],
      finishedLoading: false
    }
  },
  watch: {
    userUrls() {
      this.getUsersFullNamesForExp()
    }
  },
  methods: {
    getUsersFullNamesForExp() {
      Promise.all(
        this.userUrls.map(url => this.$Axios.get(this.$General.MainDomain + url, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))))
        .then(resArray => resArray.forEach(res => {
          this.usersFullNames.push(`${res.data.user.first_name} ${res.data.user.last_name}`)
        }))
        .then(() => this.finishedLoading = true)
        .catch(e => console.log(e))
    },
  },
  mounted() {
    this.getUsersFullNamesForExp()
  }
}
</script>

<style>
  .span-width {
    width: 150px;
  }
  .child-full-width .v-skeleton-loader__chip {
    width: 100% !important;
  }
</style>