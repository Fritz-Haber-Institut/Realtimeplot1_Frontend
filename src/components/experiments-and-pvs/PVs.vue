<template>
  <div>
    <Dialog v-if="dialog.open" v-bind="dialog" @close-dialog="closeDialog" @reload-data="getAllPVs" />
    <v-card>
      <v-card-title>
        <v-text-field full-width hide-details="" prepend-inner-icon="mdi-magnify" :label="$General.GetString('search')" v-model="searchFieldValue" />
        <v-tooltip v-if="currentUser.isAdmin" bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn fab color="info" class="ml-5" v-bind="attrs" v-on="on" @click="openCreatePVDialog">
              <v-icon> mdi-plus </v-icon>
            </v-btn>
          </template>
          {{ $General.GetString('addNewPVTooltip') }}
        </v-tooltip>
      </v-card-title>
      <v-card-text>
        <v-divider />
        <v-data-table :headers="headers" :items="pvs" :loading="false" :loading-text="$General.GetString('loading')" :no-results-text="$General.GetString('nodata')" :search="searchFieldValue" :footer-props="{ itemsPerPageOptions: [10, 20, 50, -1] }">
          <template v-slot:[`item.pv_string`]="{ item }">
            <PVStringPVsTable :pvString="item.pv_string" :currentUserExperiments="currentUserExperimentsNames"/>
          </template>
          <template v-slot:[`item.settings`]="{ item }">
            <div v-if="$vuetify.breakpoint.smAndDown" :class="actionButtonsWrapperClasses">
              <v-btn small fab color="warning" @click="openEditPVDialog(item)">
                <v-icon> mdi-pencil </v-icon>
              </v-btn>
              <v-btn fab color="error" small :class="deleteButtonClasses" @click="deletePV(item)">
                <v-icon> mdi-delete </v-icon>
              </v-btn>
            </div>
            <div v-else :class="actionButtonsWrapperClasses">
              <v-btn fab color="warning" x-small @click="openEditPVDialog(item)"><v-icon> mdi-pencil </v-icon></v-btn>
              <v-btn fab color="error" x-small :class="deleteButtonClasses" @click="deletePV(item)"><v-icon> mdi-delete </v-icon></v-btn>
            </div>
          </template>
          <template v-slot:no-data>
            <div v-if="currentUser.isAdmin">
              {{ $General.GetString('emptyTablePVsAdminPart1') }} <span class="DialogLink" @click="openCreatePVDialog">{{ $General.GetString('clickHere') }}</span> {{ $General.GetString('emptyTablePVsAdminPart2') }}
            </div>
            <div v-else>
              {{ $General.GetString('emptyTablePVsUser') }}
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <BottomSheetAlert :open="sheetAlert.open" :type="sheetAlert.type" @close-sheet="closeBottomSheet">
      {{ sheetAlert.text }}
    </BottomSheetAlert>
  </div>
</template>

<script>
import PVStringPVsTable from './pvs-components/pv-string-pvs-table.vue'
import Dialog from './dialog.vue';
import BottomSheetAlert from '../bottom-sheet-alert.vue';

export default {
  components: {
    Dialog,
    BottomSheetAlert,
    PVStringPVsTable
  },
  props: {
    shouldOpenCreateDialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      pvs: [],
      searchFieldValue: '',
      headers: [
        { text: 'PV String', value: 'pv_string' },
        { text: 'Name', value: 'human_readable_name' },
      ],
      dialog: {
        open: false,
        method: 'POST',
        type: 'pv',
        identifier: '',
      },
      sheetAlert: {
        open: false,
        type: 'sucess',
        text: '',
      },
      currentUser: {
        isAdmin: false,
        expURLs: []
      },
      pvUrls: []
    };
  },
  computed: {
    deleteButtonClasses() {
      return {
        'ml-2': this.$vuetify.breakpoint.mdAndUp || this.$vuetify.breakpoint.xs,
        'mt-2': this.$vuetify.breakpoint.smOnly,
      };
    },
    actionButtonsWrapperClasses() {
      return {
        'd-flex': true,
        'my-3': true,
        'flex-column': this.$vuetify.breakpoint.smOnly,
        'mb-3': this.$vuetify.breakpoint.xs,
      };
    },
    currentUserExperimentsNames() {
      return this.currentUser.expURLs.map(url => url.split('experiments/')[1])
    }
  },
  methods: {
    // API calls
    getCurrentUser() {
      return this.$Axios
        .get(this.$General.APIUsers() + '/current', this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
        .then(({data}) => {
          this.currentUser.isAdmin = (data.user.user_type === 'Admin')
          this.currentUser.expURLs = data.user.experiment_urls
        })
        .catch(e => console.log(e))
    },
    getAllPVs(signalCompletion) {
      this.$Axios
        .get(this.$General.APIPVs(), this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
        .then((res) => {
          this.pvs = res.data.process_variables;
          this.shouldOpenCreateDialog && this.openCreatePVDialog();
          signalCompletion && signalCompletion();
        })
        .catch(e => console.log(e))
    },
    getUserPVs() {
      Promise.all(
        this.currentUser.expURLs.map(url => this.$Axios.get(this.$General.MainDomain + url, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))))
        .then(resArray => {
          resArray.forEach(({data}) => {
            data.experiment.process_variable_urls.forEach(pvUrl => this.pvUrls.push(pvUrl))
          })
          return Promise.all(this.pvUrls.map(url => this.$Axios.get(this.$General.MainDomain + url, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))))
        })
        .then(resArray => resArray.forEach(({data}) => this.pvs.push(data.process_variable)))
        .catch(e => console.log(e))
    },
    isPVLastOfExperiment(expId, pv_string) {
      return this.$Axios
        .get(`${this.$General.APIExperiments()}/${expId}`, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
        .then((res) => {
          const experimentPVs = res.data.experiment.process_variable_urls;
          return experimentPVs.length === 1 && experimentPVs[0].split('pvs/')[1] === pv_string;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    deletePV(item) {
      const reqUrl = `${this.$General.APIPVs()}/${item.pv_string}`;
      this.isPVLastOfExperiment(item.experiment_short_id, item.pv_string)
        .then((isLastPv) => (isLastPv ? 'This PV is the last of its experiment. If you delete it, you will also delete the experiment.' : ''))
        .then((alertText) => this.$General.ConfirmDeleteAlert(item.pv_string, alertText))
        .then((isConfirmed) => (isConfirmed ? { method: 'DELETE', url: reqUrl, headers: { 'x-access-tokens': this.$General.GetLSSettings().Token } } : Promise.reject('Delete request cancelled.')))
        .then((config) => this.$Axios(config))
        .then(() => {
          this.showSheet('success', this.$General.GetString('sheetDeletePVSuccess'));
        })
        .catch((e) => {
          console.log(e);
          e.response && this.showSheet('error', this.$General.sheetDeletePVError(e.response.status));
        });
    },
    // Logic methods
    loadData() {
      this.getCurrentUser()
      .then(() => {
        if(this.currentUser.isAdmin) {
          this.getAllPVs()
          this.headers.length < 3 &&
            this.headers.push({
              value: 'settings',
              sortable: false,
              width: '105px'
            })
        } else {
          this.getUserPVs()
        }
      })
      .catch(e => console.log(e))
    },
    // UI Methods
    openCreatePVDialog() {
      this.shouldOpenCreateDialog && this.$emit('dialog-opened');
      this.dialog.method = 'POST';
      this.dialog.open = true;
    },
    openEditPVDialog(exp) {
      this.dialog.method = 'PUT';
      this.dialog.identifier = exp.pv_string;
      this.dialog.open = true;
    },
    closeDialog() {
      this.dialog.open = false;
    },
    showSheet(type, text, doCloseDialog = true) {
      this.sheetAlert.type = type;
      this.sheetAlert.text = text;
      this.sheetAlert.open = true;
      let time;
      if (type === 'error') {
        time = 4000;
      } else if (!doCloseDialog) {
        time = 3000;
      } else {
        time = 1000;
      }
      this.getAllPVs();
      setTimeout(() => {
        this.closeBottomSheet();
      }, time);
    },
    closeBottomSheet() {
      this.sheetAlert.open = false;
      this.sheetAlert.type !== 'info' && this.closeDialog();
    },
  },
  mounted() {
    this.loadData()
  },
};
</script>