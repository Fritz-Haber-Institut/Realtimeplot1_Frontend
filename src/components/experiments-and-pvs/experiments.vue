<template>
  <div>
    <Dialog v-if="dialog.open" v-bind="dialog" @close-dialog="closeDialog" @reload-data="loadData" />
    <v-card>
      <v-card-title>
        <v-text-field full-width hide-details="" prepend-inner-icon="mdi-magnify" :label="$General.GetString('search')" v-model="searchFieldValue" />
      </v-card-title>
      <v-card-text>
        <v-divider />
        <v-data-table
          :headers="headers"
          :items="experiments"
          :loading="false"
          :loading-text="$General.GetString('loading')"
          :no-results-text="$General.GetString('nodata')"
          :search="searchFieldValue"
          :show-expand="currentUser.isAdmin"
          item-key="short_id"
          :item-class="setRowClass"
          :footer-props="{ itemsPerPageOptions: [10, 20, 50, -1] } "
        >
          <template v-slot:[`item.process_variable_urls`]="{ item }">
            <PVsTitlesDialog v-if="$vuetify.breakpoint.smAndDown" :pvsUrls="item.process_variable_urls" :currentUserExperiments="currentUserExperimentsNames"/>
            <PVsTitles v-else :pvsUrls="item.process_variable_urls" :currentUserExperiments="currentUserExperimentsNames" @logged-user-assigned="addToAdminRows($event, item.short_id)"/>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <ExpUsersNames :userUrls="item.user_urls" :tdColspan="headers.length" @closeExpanded="closeExpandedItem(item.short_id)"/>
          </template>
          <template v-slot:[`item.data-table-expand`]="{ item, isExpanded, expand }">
            <span v-show="false" :id="`closeExpanded-${item.short_id}`" :ref="`closeExpanded-${item.short_id}`" @click="expand(false)"></span>
            <span v-if="item.user_urls && item.user_urls.length">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-if="isExpanded" icon class="v-data-table__expand-icon v-icon--link v-data-table__expand-icon--active" @click="expand(false)">
                    <v-icon>mdi-chevron-down</v-icon>
                  </v-btn>
                  <v-btn v-else icon class="v-data-table__expand-icon v-icon--link elevation-4 white" v-bind="attrs" v-on="on" @click="expand(true)">
                    <v-icon>mdi-account-search</v-icon>
                  </v-btn>
                </template>
                {{ $General.GetString('showAssignedUsersTooltip') }}
              </v-tooltip>
            </span>
            <v-tooltip v-else bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon class="mr-1 mr-sm-0 ml-sm-1" v-bind="attrs" v-on="on">mdi-account-off</v-icon>
              </template>
              {{ $General.GetString('noAssignedUsers') }}
            </v-tooltip>
          </template>
          <template v-slot:[`item.settings`]="{ item }">
            <div :class="actionButtonsWrapperClasses">
              <v-btn x-small fab color="warning" @click="openEditExpDialog(item)">
                <v-icon> mdi-pencil </v-icon>
              </v-btn>
              <v-btn fab color="error" x-small class="ml-2" @click="deleteExp(item.short_id)">
                <v-icon> mdi-delete </v-icon>
              </v-btn>
            </div>
          </template>
          <template v-slot:no-data>
            <div v-if="currentUser.isAdmin">
              {{ $General.GetString('emptyTableExpAdminPart1') }} <span class="DialogLink" @click="openCreatePVDialog">{{ $General.GetString('createNewPV') }}</span> {{ $General.GetString('emptyTableExpAdminPart2') }}
            </div>
            <div v-else>
              {{ $General.GetString('emptyTableExpUser') }}
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
import Dialog from './dialog.vue';
import PVsTitles from './experiments-components/pvs-titles-exp-table.vue';
import PVsTitlesDialog from './experiments-components/pvs-titles-dialog.vue'
import ExpUsersNames from './experiments-components/exp-users-names.vue';
import BottomSheetAlert from '../bottom-sheet-alert.vue';

export default {
  components: {
    Dialog,
    PVsTitles,
    PVsTitlesDialog,
    ExpUsersNames,
    BottomSheetAlert,
  },
  data() {
    return {
      experiments: [],
      searchFieldValue: '',
      headers: [
        { text: 'ID', value: 'short_id' },
        { text: 'Name', value: 'human_readable_name' },
        { text: 'PVs', value: 'process_variable_urls' },
      ],
      dialog: {
        open: false,
        method: 'POST',
        type: 'exp',
        identifier: '',
      },
      sheetAlert: {
        open: false,
        type: 'sucess',
        text: '',
      },
      shouldRenderPVsTitles: true,
      currentUser: {
        isAdmin: false,
        expURLs: []
      },
      adminRows: []
    };
  },
  computed: {
    actionButtonsWrapperClasses() {
      return {
        'd-flex': true,
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
        .get(this.$General.APIUsers() + '/current', this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
        .then(({data}) => {
          this.currentUser.isAdmin = (data.user.user_type === 'Admin')
          this.currentUser.expURLs = data.user.experiment_urls
        })
        .catch(e => console.log(e))
    },
    getAllExperiments() {
      this.shouldRenderPVsTitles = false
      this.$Axios
        .get(this.$General.APIExperiments() + '/', this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
        .then((res) => {
          this.experiments = res.data.experiments;
          this.shouldRenderPVsTitles = true;
        })
        .catch(e => console.log(e))
    },
    getUserExperiments() {
      this.shouldRenderPVsTitles = false // delete it later
      Promise.all(
        this.currentUser.expURLs.map(url => this.$Axios.get(this.$General.MainDomain + url, this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))))
        .then(resArray => resArray.forEach(({data}) => this.experiments.push(data.experiment)))
        .catch(e => console.log(e))
    },
    deleteExp(short_id) {
      const reqUrl = `${this.$General.APIExperiments()}/${short_id}`;
      const alertText = 'All corresponding PVs will also be deleted.';
      this.$General
        .ConfirmDeleteAlert(short_id, alertText)
        .then((isConfirmed) => (isConfirmed ? { method: 'DELETE', url: reqUrl, headers: { 'x-access-tokens': this.$General.GetLSSettings('Token') } } : Promise.reject('Delete request cancelled.')))
        .then((config) => this.$Axios(config))
        .then(() => {
          this.showSheet('success', this.$General.GetString('sheetDeleteExpSuccess'));
        })
        .catch((e) => {
          console.log(e);
          e.response && this.showSheet('error', this.$General.sheetDeleteExpError(e.response.status));
        });
    },
    // Logic methods
    loadData() {
      this.getCurrentUser()
      .then(() => {
        if (this.currentUser.isAdmin) {
          this.getAllExperiments()
          if (this.headers.length < 4) {
            this.headers.push({ text: 'Users', value: 'data-table-expand' })
            this.headers.push({ value: 'settings', sortable: false, width: '105px'
            })
          }
        } else {
          this.getUserExperiments()
        }
      })
      .catch(e => console.log(e))
    },
    // UI methods
    openCreatePVDialog() {
      this.$emit('switch-to-pv-tab');
    },
    openEditExpDialog(exp) {
      this.dialog.type = 'exp';
      this.dialog.method = 'PUT';
      this.dialog.identifier = exp.short_id;
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
      this.getAllExperiments();
      setTimeout(() => {
        this.closeBottomSheet();
      }, time);
    },
    closeBottomSheet() {
      this.sheetAlert.open = false;
      this.sheetAlert.type !== 'info' && this.closeDialog();
    },
    closeExpandedItem(id) {
      this.$refs[`closeExpanded-${id}`].click()
    },
    addToAdminRows(e, id) {
      if (!this.adminRows.includes(id)) {
        e && this.adminRows.push(id)
      } else {
        const i = this.adminRows.indexOf(id)
        !e && this.adminRows.splice(i, 1)
      }
    },
    setRowClass(item) {
      return (this.currentUser.isAdmin && this.adminRows.includes(item.short_id)) ? 'green lighten-5' : ''
    }
  },
  mounted() {
    this.loadData()
  },
};
</script>