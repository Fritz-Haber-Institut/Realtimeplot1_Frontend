<template>
  <table>
    <tr v-for="(_, idx) in pvsUrls" :key="idx">
      <div v-if="isLoggedUserAssigned">
        <router-link v-if="finishedLoading" :to="`/chart?pvstring=${pvsStrings[idx]}`">
          <v-chip label class="my-2" color="secondary" style="cursor: pointer;">
            <v-icon left>mdi-text-box-outline</v-icon>
            {{ pvsTitles[idx] }}
          </v-chip>
        </router-link>
        <v-skeleton-loader v-else :class="skeletonClasses" type="chip" tile/>
      </div>
      <div v-else class="my-2">
        {{ pvsTitles[idx] }}
      </div>
    </tr>
  </table>
</template>

<script>
export default {
  props: {
    pvsUrls: {
      type: Array,
      required: true
    },
    currentUserExpURLs: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      pvsTitles: [],
      finishedLoading: false,
      isLoggedUserAssigned: false
    }
  },
  computed: {
    pvsStrings(){
      return this.pvsUrls.map(url => url.split('pvs/')[1])
    },
    skeletonClasses() {
      return {
        'my-2' : true,
        'pvs-titles-width--desktop': !this.$vuetify.breakpoint.mobile,
        'pvs-titles-width--mobile': this.$vuetify.breakpoint.mobile
      }
    }
  },
  watch: {
    pvsUrls() {
      this.getPVTitles()
    },
    currentUserExpURLs() {
      this.checkIfUserOwnsPV()
    }
  },
  methods: {
    getPVTitles() {
      Promise.all(
        this.pvsUrls.map(url => this.$Axios.get(this.$General.MainDomain + url, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))))
        .then(resArray => resArray.forEach((res, idx) => {
          const pvName = res.data.process_variable.human_readable_name
          this.pvsTitles.push(pvName ? `${pvName} (${this.pvsStrings[idx]})` : this.pvsStrings[idx])
        }))
        .then(() => {
          this.finishedLoading = true
        })
        .catch(e => console.log(e))
    },
    checkIfUserOwnsPV() {
      const currentUserExperiments = this.currentUserExpURLs.map(url => url.split('experiments/')[1])
      this.isLoggedUserAssigned = currentUserExperiments.some(exp => exp === this.pvsStrings[0].split(':')[0])
    }
  },
  mounted() {
    this.getPVTitles()
  }
}
</script>
<style>
  .pvs-titles-width--desktop {
    width: 400px;
  }
  .pvs-titles-width--mobile {
    width: 150px;
  }
  [class*="pvs-titles-width"] > .v-skeleton-loader__chip {
    width: 100%;
  }
</style>