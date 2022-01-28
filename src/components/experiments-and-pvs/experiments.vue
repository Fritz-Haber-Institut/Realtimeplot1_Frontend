<template>
  <v-container class="mt-10">
    <Dialog v-if="dialog.open" v-bind="dialog" @close-dialog="closeDialog" @reload-data="getExperiments"/>
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
          show-expand
          item-key="short_id"
          :footer-props="{ itemsPerPageOptions: [10, 20, 50, -1] }"
        >
          <template v-slot:[`item.process_variable_urls`]="{ item }">
            <PVsTableTitles v-if="shouldRenderPVsTitles" :pvsUrls="item.process_variable_urls" />
          </template>
            <!-- { headers, item, isMobile } -->
          <template v-slot:expanded-item="{ headers, item }">
            <ExpUsersNames :userUrls="item.user_urls" :tdColspan="headers.length" />
          </template>
          <template v-slot:[`item.data-table-expand`]="{ item, isExpanded, expand }">
            <v-btn v-if="item.user_urls.length" icon :class="`v-data-table__expand-icon v-icon--link ${isExpanded && 'v-data-table__expand-icon--active'}`" @click="expand(!isExpanded)">
              <v-icon>mdi-chevron-down</v-icon>
            </v-btn>
            <v-tooltip v-else bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-row justify="center">
                  <v-icon class="mx-auto" v-bind="attrs" v-on="on">mdi-account-off</v-icon>
                </v-row>
              </template>
              {{ $General.GetString('noAssignedUsers') }}
            </v-tooltip>
          </template>
          <template v-slot:[`item.settings`]="{ item }">
            <div :class="actionButtonsWrapperClasses">
              <v-btn small fab color="warning" @click="openEditExpDialog(item)">
                <v-icon> mdi-pencil </v-icon>
              </v-btn>
              <v-btn fab color="error" small :class="deleteButtonClasses" @click="deleteExp(item.short_id)">
                <v-icon> mdi-delete </v-icon>
              </v-btn>
            </div>
          </template>
          <template v-slot:no-data>
            {{ $General.GetString('emptyTableExpPart1') }} <span class="DialogLink" @click="openCreatePVDialog">{{ $General.GetString('createNewPV') }}</span> {{ $General.GetString('emptyTableExpPart2') }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <BottomSheetAlert :open="sheetAlert.open" :type="sheetAlert.type" @close-sheet="closeBottomSheet">
      {{ sheetAlert.text }}
    </BottomSheetAlert>
  </v-container>
</template>

<script>
import Dialog from './dialog.vue'
import PVsTableTitles from './pvs-table-titles.vue'
import ExpUsersNames from './exp-users-names.vue'
import BottomSheetAlert from '../bottom-sheet-alert.vue'

export default {
  components: {
    Dialog,
    PVsTableTitles,
    ExpUsersNames,
    BottomSheetAlert
  },
  props: {
    hasActiveTab: {
      type: Boolean,
      default: true,
      required: true
    }
  },
  data() {
    return {
      experiments: [],
      searchFieldValue: '',
      headers: [
        { text: 'ID', value: 'short_id' },
        { text: 'Name', value: 'human_readable_name' },
        { text: 'PVs', value: 'process_variable_urls' },
        { text: 'Users', value: 'data-table-expand' },
        { value: 'settings', sortable: false }
      ],
      dialog: {
        open: false,
        method: 'POST',
        type: 'exp',
        identifier: ''
      },
      sheetAlert: {
        open: false,
        type: 'sucess',
        text: '',
      },
      shouldRenderPVsTitles: true
    }
  },
  computed:{
    deleteButtonClasses() {
      return {
        'ml-2': this.$vuetify.breakpoint.mdAndUp || this.$vuetify.breakpoint.xs,
        'mt-2': this.$vuetify.breakpoint.smOnly
      }
    },
    actionButtonsWrapperClasses() {
      return {
        'd-flex': true,
        'flex-column': this.$vuetify.breakpoint.smOnly,
        'mb-3': this.$vuetify.breakpoint.xs
      }
    }
  },
  watch: {
    hasActiveTab(val) {
      val || setTimeout(() => this.shouldRenderPVsTitles = false, 500) // waiting for the fade-out to complete
      val && this.getExperiments()
    }
  },
  methods: {
    // API calls
    getExperiments() {
      this.$Axios
      .get(this.$General.APIExperiments() + '/', this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
      .then(res => {
        this.experiments = res.data.experiments
        this.shouldRenderPVsTitles = true
      })
      .catch(e => {
        console.log(e)
      })
    },
    deleteExp(short_id) {
      const reqUrl = `${this.$General.APIExperiments()}/${short_id}`
      const alertText = 'All corresponding PVs will also be deleted.'
      this.$General.ConfirmDeleteAlert(short_id, alertText)
      .then(isConfirmed => 
        isConfirmed ? 
        { method: 'DELETE', url: reqUrl, headers: { 'x-access-tokens': this.$General.GetLSSettings().Token } } : 
        Promise.reject('Delete request cancelled.'))
      .then(config => this.$Axios(config))
      .then(() => {
        this.showSheet('success', this.$General.GetString('sheetDeleteExpSuccess')) 
      })
      .catch(e => {
        console.log(e)
        e.response && this.showSheet('error', this.$General.sheetDeleteExpError(e.response.status))
      })
    },
    // UI methods
    openCreatePVDialog() {
      // this.dialog.type='pv'
      // this.dialog.method='POST'
      // this.dialog.open = true
      this.$emit('switch-to-pv-tab')
    },
    openEditExpDialog(exp) {
      this.dialog.type='exp'
      this.dialog.method='PUT'
      this.dialog.identifier=exp.short_id
      this.dialog.open = true
    },
    closeDialog() {
      this.dialog.open=false
    },
    showSheet(type, text, doCloseDialog = true) {
      this.sheetAlert.type = type;
      this.sheetAlert.text = text;
      this.sheetAlert.open = true;
      let time
      if (type === 'error') {
        time = 4000
      } else if (!doCloseDialog) {
        time = 3000
      } else {
        time = 1000
      }
      this.getExperiments()
      setTimeout(() => {
        this.closeBottomSheet()
      }, time);
    },
    closeBottomSheet() {
      this.sheetAlert.open = false
      this.sheetAlert.type !== 'info' && this.closeDialog()
    }
  },
  mounted() {
    this.getExperiments()
  }
};
</script>