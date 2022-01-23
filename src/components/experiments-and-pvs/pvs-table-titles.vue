<template>
  <table>
    <tr v-for="(_, idx) in pvsUrls" :key="idx">
      <router-link v-if="finishedLoading" :to="`/dashboard?pvstring=${pvsStrings[idx]}`">
        <v-chip label class="my-2" color="default" style="cursor: pointer;">
          <v-icon left>mdi-text-box-outline</v-icon>
          {{ pvsTitles[idx] }}
        </v-chip>
      </router-link>
      <v-skeleton-loader v-else class="my-2" type="chip" tile />
    </tr>
  </table>
</template>

<script>
export default {
  props: {
    pvsUrls: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      pvsTitles: [],
      finishedLoading: false
    }
  },
  watch: {
    pvsUrls() {
      this.getPVTitles()
    },
  },
  computed: {
    pvsStrings(){
      return this.pvsUrls.map(url => url.split('pvs/')[1])
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
    }
  },
  mounted() {
    this.getPVTitles()
  }
}
</script>