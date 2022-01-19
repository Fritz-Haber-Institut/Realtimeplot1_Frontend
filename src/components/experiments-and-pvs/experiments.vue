<template>
  <v-container fluid class="mt-10">
    <Dialog v-if="dialog.open" :type="dialog.type" :method="dialog.method" :identifier="dialog.short_id" :open="dialog.open" @close-dialog="closeDialog"/>
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
          :expanded.sync="expandedRows"
          item-key="short_id"
          class=""
        >
          <template v-slot:[`item.users`]="{ item }">
            <v-row v-for="(userUrl, idx) in item.userUrls" :key="idx">
              <v-chip
                color="primary"
              >
                <v-avatar class="accent white--text" left>
                  <v-icon>mdi-account-circle</v-icon>
                </v-avatar>
                {{ /* getUserFirstAndLastName(userUrl)*/ }}
              </v-chip>
            </v-row>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="pt-3">
              <span v-for="(userUrl, idx) in item.userUrls" :key="idx">
                <v-chip color="primary" class="mr-2 mb-2">
                  <v-avatar class="accent white--text" left>
                    <v-icon>mdi-account-circle</v-icon>
                  </v-avatar>
                  {{userUrl + idx}}
                  {{ /* getUserFirstAndLastName(userUrl)*/ }}
                </v-chip>
              </span>
            </td>
          </template>
          <template v-slot:[`item.settings`]="{ item }">
            <v-icon color="warning" small @click="openEditExpDialog(item)"> mdi-pencil </v-icon>
            <v-icon color="error" small class="ml-2" @click="deleteExp(item.short_id)"> mdi-delete </v-icon>
          </template>
          <template v-slot:no-data>
            There are no saved experiments. <span class="DialogLink" @click="openCreatePVDialog">Create a new PV</span> to set up an experiment.
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
    experiments: {
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
        { text: 'ID', value: 'short_id' },
        { text: 'Name', value: 'name' },
        { text: 'PVs', value: 'pvs' },
        { text: 'Users', value: 'data-table-expand' },
        { value: 'settings', sortable: false }
      ],
      dialog: {
        open: false,
        method: 'POST',
        type: 'exp',
        short_id: ''
      },
      expandedRows: []
    }
  },
  methods: {
    // API calls
    getUserFirstAndLastName(userUrl) {
      let fullName = ''
      this.$Axios.get(this.$General.MainDomain + userUrl, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
        .then(res => {
          fullName = `${res.data.user.first_name} ${res.data.user.last_name}`
        })
        .catch((e) => {
          console.log(e);
        });
      return fullName
    },
    deleteExp(short_id) {
      const reqUrl = `${this.$General.APIExperiments()}/${short_id}`
      const alertText = 'All corresponding PVs will also be deleted.'
      this.$General.ConfirmDeleteAlert(short_id, alertText).then((Result) => {
        if (Result) {
          var AxiosConfig = { method: 'DELETE', url: reqUrl, headers: { 'x-access-tokens': this.$General.GetLSSettings().Token } };
          this.$Axios(AxiosConfig)
            .then((Result) => {
              console.log(Result)
              this.$emit('reload-experiments')
            })
            .catch((Error) => {
              console.log(Error);
            });
        }
      });
    },
    // UI methods
    openCreatePVDialog() {
      this.dialog.type='pv'
      this.dialog.method='POST'
      this.dialog.open = true
    },
    openEditExpDialog(exp) {
      this.dialog.type='exp'
      this.dialog.method='PUT'
      this.dialog.short_id=exp.short_id
      this.dialog.open = true
    },
    closeDialog() {
      this.$emit('reload-experiments')
      this.dialog.open=false
    },
  },
  // mounted() {
  //   this.getExperiments()
  // }
};
</script>