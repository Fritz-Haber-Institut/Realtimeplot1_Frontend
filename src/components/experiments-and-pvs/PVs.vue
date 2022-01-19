<template>
  <v-container fluid class="mt-10">
    <Dialog v-if="dialog.open" :type="dialog.type" :method="dialog.method" :identifier="dialog.pv_string" :open="dialog.open" @close-dialog="closeDialog"/>
    <v-card>
      <v-card-title>
        <v-text-field full-width hide-details="" prepend-inner-icon="mdi-magnify" :label="$General.GetString('search')" v-model="searchFieldValue" />
        <v-tooltip bottom>
          <template
            v-slot:activator="{ on, attrs }"
          >
            <v-btn fab color="info" class="ml-5" v-bind="attrs" v-on="on" @click="openCreatePVDialog">
              <v-icon> mdi-plus </v-icon>
            </v-btn>
          </template>
          {{ $General.GetString('addNewPVTooltip') }}
        </v-tooltip>
      </v-card-title>
      <v-card-text>
        <v-divider />
        <v-data-table
          :headers="headers"
          :items="pvs"
          :loading="false"
          :loading-text="$General.GetString('loading')"
          :no-results-text="$General.GetString('nodata')"
          :search="searchFieldValue"
          class=""
        >
          <template v-slot:[`item.settings`]="{ item }">
            <v-icon color="warning" small @click="openEditPVDialog(item)"> mdi-pencil </v-icon>
            <v-icon color="error" small class="ml-2" @click="deletePV(item)"> mdi-delete </v-icon>
          </template>
          <template v-slot:no-data>
            There are no saved PVs. <span class="DialogLink" @click="openCreatePVDialog">Click here</span> or the "+" button to create a new one.
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Dialog from './dialog.vue'

export default {
  props: {
    pvs: {
      type: Array,
      required: true,
    },
  },
  components: {
    Dialog
  },
  data() {
    return {
      searchFieldValue: '',
      headers: [
        { text: 'PV String', value: 'pv_string' },
        { text: 'Name', value: 'name' },
        { value: 'settings', sortable: false }
      ],
      dialog: {
        open: false,
        method: 'POST',
        type: 'pv',
        pv_string: ''
      },
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New PV" : "Edit PV";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  methods: {
    // API calls
    isPVLastOfExperiment(experimentId, pv_string) {
      this.$Axios
      .get(`${this.$General.APIExperiments()}/${experimentId}`, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
      .then(res => {
        // console.log(res.data)
        const experimentPVs = res.data.experiment.process_variable_urls.map(pvUrl => pvUrl.split('pvs/')[1])
        return experimentPVs.length === 1 && experimentPVs[0] === pv_string
      })
      .catch(e => {
        console.log(e)
      })
    },
    deletePV(item) {
      const reqUrl = `${this.$General.APIPVs()}/${item.pv_string}`
      const alertText = this.isPVLastOfExperiment(item.experimentId, item.pv_string) ? 'This PV is the last of its experiment. If you delete it, you will also delete the experiment.' : ''
      this.$General.ConfirmDeleteAlert(item.pv_string, alertText).then((Result) => {
        if (Result) {
          var AxiosConfig = { method: 'DELETE', url: reqUrl, headers: { 'x-access-tokens': this.$General.GetLSSettings().Token } };
          this.$Axios(AxiosConfig)
            .then((Result) => {
              console.log(Result)
              this.$emit('reload-pvs')
              this.isPVLastOfExperiment(item.experimentId, item.pv_string) && this.$emit('reload-experiments')
            })
            .catch((Error) => {
              console.log(Error);
            });
        }
      });
    },
    // UI Methods
    openCreatePVDialog() {
      this.dialog.method='POST'
      this.dialog.open = true
    },
    openEditPVDialog(exp) {
      this.dialog.method='PUT'
      this.dialog.pv_string=exp.pv_string
      this.dialog.open = true
    },
    closeDialog() {
      this.$emit('reload-pvs')
      this.dialog.open=false
    }
  },
  // mounted() {
  //   this.getPVs()
  // }
};
</script>
<style>
  .DialogLink {
    text-decoration: underline;
    cursor: pointer;
  }
</style>