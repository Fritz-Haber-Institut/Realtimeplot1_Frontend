<template>
  <table>
    <tr v-for="(_, idx) in pvsUrls" :key="idx">
      <v-chip v-if="finishedLoading" label class="my-2" color="default">
        <v-icon left>mdi-text-box-outline</v-icon>
        {{ pvsTitles[idx] }}
      </v-chip>
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
  methods: {
    getPVTitles() {
      Promise.all(
        this.pvsUrls.map(url => this.$Axios.get(this.$General.MainDomain + url, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))))
        .then(resArray => resArray.forEach((res, idx) => {
          const pv_string = this.pvsUrls[idx].split('pvs/')[1]
          const pvName = res.data.process_variable.human_readable_name
          if (pvName) {
            this.pvsTitles.push(`${pvName} (${pv_string})`)
          } else {
            this.pvsTitles.push(pv_string)
          }
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