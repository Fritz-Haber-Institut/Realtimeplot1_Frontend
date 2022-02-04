<template>
  <v-container>
    <v-card>
      <v-card-title>
        Subscribe to PV tresholds
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="9">
            <v-switch v-if="currentUser.email" v-model="isSwitchOn" label="Use saved e-mail address"></v-switch>
            <v-text-field v-if="!isSwitchOn" autocomplete="new-value" prepend-inner-icon="mdi-email" :label="$General.GetString('emailSubPlaceholder')" v-model="emailForSub" :rules="[(v) => !!v || $General.GetString('noempty'), (v) => this.$General.emailRegex.test(v) || this.$General.GetString('wrongemailformat')]" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <v-text-field prepend-inner-icon="mdi-arrow-down-bold" label="Min treshold" :placeholder="getTresholdInputPlaceholder('min')" v-model="tresholdMin" :rules="tresholdRules" />
          </v-col>
          <v-col cols="4">
            <v-text-field prepend-inner-icon="mdi-arrow-up-bold" label="Max treshold" :placeholder="getTresholdInputPlaceholder('max')" v-model="tresholdMax" :rules="tresholdRules" />
          </v-col>
          <v-col cols="4" align-self="center">
            <v-btn block rounded color="secondary" dark @click="subscribe">Subscribe</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <BottomSheetAlert :open="sheetAlert.open" :type="sheetAlert.type" @close-sheet="closeBottomSheet">
      {{ sheetAlert.text }}
    </BottomSheetAlert>
  </v-container>
</template>

<script>
import BottomSheetAlert from '../bottom-sheet-alert.vue'

export default {
  components: {
    BottomSheetAlert
  },
  props: {
    pvString: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      emailForSub: '',
      tresholdMin: '',
      tresholdMax: '',
      defaultTresholdMin: null,
      defaultTresholdMax: null,
      isSwitchOn: true,
      currentUser: {},
      sheetAlert: {
        open: false,
        type: 'sucess',
        text: '',
      },
    }
  },
  computed: {
    tresholdRules() {
      return [(v) => !!v || this.$General.GetString('noempty'), (v) => Number.isInteger(parseFloat(v)) || 'Please insert only integers']
    },
  },
  methods: {
    getCurrentUser() {
      return this.$Axios
      .get(this.$General.APIUsers() + '/current', this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
      .then(({data}) => {
        this.currentUser = data.user
      })
      .catch(e => console.log(e))
    },
    getPV() {
      this.$Axios.get(this.$General.APIPVs() + '/' + this.pvString, this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
      .then(({data}) => {
        data.process_variable.threshold_min && (this.defaultTresholdMin = data.process_variable.threshold_min)
        data.process_variable.threshold_max && (this.defaultTresholdMax = data.process_variable.threshold_max)
      })
    },
    getTresholdInputPlaceholder(kind) {
      if (kind === 'min') {
        return this.defaultTresholdMin ? `Default min value for this PV is: ${this.defaultTresholdMin}` : ''
      } else {
        return this.defaultTresholdMax ? `Default max value for this PV is: ${this.defaultTresholdMax}` : ''
      }
    },
    subscribe() {
      const reqBody = {}

      if (this.isSwitchOn && this.currentUser.email) {
        reqBody.email = this.currentUser.email
      } else if (!this.isSwitchOn && this.emailForSub) {
        reqBody.email = this.emailForSub
      }
      if (this.tresholdMin) {
        reqBody.threshold_min = this.tresholdMin
      } else if (this.defaultTresholdMin) {
        reqBody.threshold_min = this.defaultTresholdMin
      }
      if (this.tresholdMax) {
        reqBody.threshold_max = this.tresholdMax
      } else if (this.defaultTresholdMax) {
        reqBody.threshold_max = this.defaultTresholdMax
      }

      if (Object.keys(reqBody).length < 3) {
        this.showSheet('info', 'Please input all values!', 5000)
        return
      }

      const axiosConfig = {
        method: 'POST',
        url: this.$General.MainDomain + `/email/subscribe/${this.pvString}`,
        headers: { 
          'x-access-tokens': this.$General.GetLSSettings('Token'),
          'Content-Type': 'application/json'
        },
        data: reqBody
      }
      this.$Axios(axiosConfig)
      .then(() => {
        this.showSheet('success', 'Subscription set successfully!')
      })
      .catch(e =>{
        e.response.data.errors ? console.log(e.response.data.errors) : console.log(e)
        e.response && this.showSheet('error', `Subscription failed. HTTP Error: ${e.response.status}`)
      })
    },
    showSheet(type, text, customTime) {
      this.sheetAlert.type = type;
      this.sheetAlert.text = text;
      this.sheetAlert.open = true;
      let time
      if (customTime) {
        time = customTime
      } else if (type === 'error') {
        time = 4000
      } else {
        time = 3000
      }
      setTimeout(() => {
        this.closeBottomSheet()
      }, time);
    },
    closeBottomSheet() {
      this.sheetAlert.open = false
    },
  },
  mounted() {
    this.getCurrentUser()
    .then(() => this.getPV())
  }
}
</script>

<style>

</style>