<template>
  <table>
    <tr v-for="(_, idx) in pvsUrls" :key="idx">
      <transition name="fade" leave-class="v-leave-class" leave-active-class="v-leave-active-class">
        <div v-show="isLoggedUserAssigned">
          <router-link v-if="finishedLoading" :to="`/chart?pvstring=${pvsStrings[idx]}`">
          <v-hover v-slot="{ hover }">
            <v-chip label :class="getChipClasses(hover)" color="secondary" style="cursor: pointer;">
              <v-icon left>mdi-chart-line</v-icon>
              <span>
                <span v-html="pvsTitles[idx]"></span>
              </span>
            </v-chip>
          </v-hover>
          </router-link>
          <v-skeleton-loader v-else :class="skeletonClasses" type="chip" tile/>
        </div>
      </transition>
      <div v-show="!isLoggedUserAssigned" class="my-2">
        <span v-html="pvsTitles[idx]"></span>
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
    currentUserExperiments: {
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
    currentUserExperiments() {
      this.checkIfUserOwnsPV()
    }
  },
  methods: {
    getPVTitles() {
      Promise.all(
        this.pvsUrls.map(url => this.$Axios.get(this.$General.MainDomain + url, this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))))
        .then(resArray => resArray.forEach((res, idx) => {
          const pvName = res.data.process_variable.human_readable_name
          if (pvName) {
            // Inserting <wbr> after whitespaces and ":"
            const formattedPVString = `${pvName} <wbr>(${this.pvsStrings[idx]})`.split('').map(s => {
              if (s === ':') return s.concat('<wbr>')
              else return s
            }).join('')
            this.pvsTitles.push(formattedPVString)
          } else {
            this.pvsTitles.push(this.pvsStrings[idx])
          }
        }))
        .then(() => {
          this.finishedLoading = true
        })
        .catch(e => console.log(e))
    },
    checkIfUserOwnsPV() {
      this.isLoggedUserAssigned = this.currentUserExperiments.some(exp => exp === this.pvsStrings[0].split(':')[0])
      this.$emit('logged-user-assigned', this.isLoggedUserAssigned)
    },
    getChipClasses(hover) {
      return {
        'my-2': true,
        'with-transition': true,
        'elevation-12 raise-up' : hover,
        'elevation-3': !hover,
        'mobile-view': this.$vuetify.breakpoint.smAndDown
      }
    }
  },
  mounted() {
    this.getPVTitles()
    this.checkIfUserOwnsPV()
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
<style scoped>
  .raise-up {
    transform: translateY(-2px);
  }
  .with-transition {
    transition: transform 200ms ease-in;
  }
  .mobile-view {
    height: auto;
    padding: 8px 14px;
    white-space: normal;
  }
</style>