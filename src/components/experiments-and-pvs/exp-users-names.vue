<template>
  <td :colspan="tdColspan" class="pt-3">
    <span v-for="(_, idx) in userUrls" :key="idx">
      <v-chip v-if="!loading" class="mr-2 mb-2" color="primary">
        <v-icon left>mdi-account-circle-outline</v-icon>
        {{ usersFullNames[idx] }}
      </v-chip>
      <v-skeleton-loader v-else :class="skeletonClasses" type="chip" />
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
      loading: false
    }
  },
  computed: {
    skeletonClasses() {
      return {
        'mr-2': true, 
        'mb-2': true,
        'd-inline-block': true,
        'exp-users-names-width': true,
      }
    },
  },
  watch: {
    userUrls() {
      this.getUsersFullNamesForExp()
    }
  },
  methods: {
    getUsersFullNamesForExp() {
      this.usersFullNames = []
      this.loading = true
      Promise.all(
        this.userUrls.map(url => this.$Axios.get(this.$General.MainDomain + url, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))))
        .then(resArray => resArray.forEach(res => {
          this.usersFullNames.push(`${res.data.user.first_name} ${res.data.user.last_name}`)
        }))
        .then(() => this.loading = false)
        .catch(e => console.log(e))
    },
  },
  mounted() {
    this.getUsersFullNamesForExp()
  }
}
</script>

<style>
  .exp-users-names-width {
    width: 120px;
  }
  /* .exp-users-names-width--mobile {
    width: 120px;
  } */
  [class*="exp-users-names-width"] > .v-skeleton-loader__chip {
    width: 100%;
  }
</style>