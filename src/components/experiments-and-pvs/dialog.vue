<template>
  <v-dialog v-model="isDialogOpen" max-width="700px">
    <v-card>
      <v-card-title>
        {{ getDialogTitle }}
      </v-card-title>
      <v-card-text>
        <v-form lazy-validation autocomplete="off">
          <v-row>
            <v-col cols="12" v-if="isExperiment">
              <v-text-field
                label="Name"
                v-model.trim="tempExp.human_readable_name"
                @keydown="activateConfirmButton"
              />
            </v-col>
            <v-col cols="6" v-if="!isExperiment">
              <v-text-field label="PV String" v-model.trim="tempPV.pv_string" @keydown="activateConfirmButton" />
            </v-col>
            <v-col cols="6" v-if="!isExperiment">
              <v-text-field label="Name (optional)" v-model.trim="tempPV.human_readable_name" @keydown="activateConfirmButton" />
            </v-col>
          </v-row>
          <v-row v-if="isExperiment">
            <v-col cols="9">
              <v-combobox
                v-model="expUserNames"
                :items="allUserNames"
                label="Assigned users"
                hide-no-data
                multiple
                chips
                @focus="getAllUserNames"
                @change="activateConfirmButton"
              >
                <template v-slot:selection="data">
                  <v-chip
                    :key="JSON.stringify(data.item)"
                    v-bind="data.attrs"
                    :input-value="data.selected"
                    :disabled="data.disabled"
                    @click:close="data.parent.selectItem(data.item)"
                    color="primary"
                  >
                    <v-icon left>mdi-account-circle-outline</v-icon>
                    {{ data.item.text }}
                  </v-chip>
                </template>
              </v-combobox>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click.native="closeDialog">Cancel</v-btn>
        <ButtonWithLoading v-if="isCreating" :disabled="confirmButtonDisabled" @clicked="initiatePVCreation" :loading="reqLoading">Create</ButtonWithLoading>
        <ButtonWithLoading v-else :disabled="confirmButtonDisabled" @clicked="updateResource" :loading="reqLoading">{{ `Update${isExperiment ? ' experiment' : ' PV'}` }}</ButtonWithLoading>
      </v-card-actions>
    </v-card>
    <BottomSheetAlert :open="sheetAlert.open" :type="sheetAlert.type" @close-sheet="closeBottomSheet">
      {{ sheetAlert.text }}
    </BottomSheetAlert>
  </v-dialog>
</template>

<script>
import ButtonWithLoading from '../button-with-loading.vue'
import BottomSheetAlert from '../bottom-sheet-alert.vue'

export default {
  components: {
    ButtonWithLoading,
    BottomSheetAlert
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
      default: 'POST',
      validator: val => ["POST", "PUT"].includes(val)
    },
    open: {
      type: Boolean,
      required: true,
      default: false,
    },
    identifier: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      tempExp: {
        short_id: "",
        human_readable_name: "",
        user_urls: [],
        users_to_remove: [],
        users_to_add: []
      },
      tempExp_human_readable_name_COPY: '',
      tempPV: {
        pv_string: "",
        human_readable_name: "", // optional
      },
      tempPV_pv_string_COPY: '',
      tempPV_human_readable_name_COPY: '',
      axiosConfig: {},
      allUserNames: [],
      expUserNames: [],
      expUserNames_COPY: [],
      confirmButtonDisabled: true,
      sheetAlert: {
        open: false,
        type: 'sucess',
        text: "",
      },
      reqLoading: false
    };
  },
  computed: {
    isExperiment() {
      return this.type === "exp";
    },
    isCreating() {
      return this.method === "POST"
    },
    isUpdating() {
      return this.method === "PUT";
    },
    isDialogOpen: {
      get() {
        return this.open;
      },
      set() {
        this.closeDialog();
      },
    },
    getDialogTitle() {
      // not having a title for creating experiments since such an action is not directly supported (available only through creating a PV)
      if (this.isExperiment && this.isUpdating)
        return "Update experiment " + this.tempExp.short_id;
      if (!this.isExperiment && this.isUpdating)
        return "Update PV " + this.tempPV_pv_string_COPY;
      else return "Create PV";
    },
  },
  methods: {
    initiatePVCreation() {
      this.reqLoading = true
      this.$emit('reload-data', this.checkAndCreatePV)
    },
    // API methods
    checkAndCreatePV() {
      if (!this.tempPV.pv_string) {
        this.showSheet('info', this.$General.GetString('sheetCreatePVEmptyPVString'), false)
        this.reqLoading = false
        return
      }
      const allPVs = this.$parent.pvs.map(({ pv_string }) => pv_string)
      if (allPVs.includes(this.tempPV.pv_string)) {
        this.showSheet('error', this.$General.GetString('sheetCreatePVAlreadyCreated'), false)
      } else {
        this.isPVInArchiver()
        .then(isIt => {
          if (!isIt) {
            this.showSheet('error', this.$General.GetString('sheetPVNotInArchiver'))
            return Promise.reject('ERROR: ' + this.$General.GetString('sheetPVNotInArchiver'))
          } else {
            return { method: "POST", url: this.$General.APIPVs(), headers: { "x-access-tokens": this.$General.GetLSSettings('Token'), "Content-Type": "application/json" }, data: this.tempPV }
          }
        })
        .then(config => this.$Axios(config))
        .then(() => {
          this.reqLoading = false
          this.showSheet("success", this.$General.GetString('sheetNewPVSuccess'))
        })
        .catch(e => {
          e.response && console.log(e)
          e.response && this.showSheet("error", this.$General.sheetNewPVError(e.response.status))
          e[0] === 'E' && this.showSheet('error', this.$General.GetString('sheetPVNotInArchiver')) 
        })
      }
    },
    isPVInArchiver() {
      return this.$Axios.get(this.$General.APIValidatePVString(this.tempPV.pv_string), this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
      .then(({data}) => data.pv_string_exists)
    },
    getResource() {
      const reqUrl = `${this.isExperiment ? this.$General.APIExperiments() : this.$General.APIPVs()}/${this.$props.identifier}`
      this.$Axios.get(reqUrl, this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
        .then(({data}) => {
          if (this.isExperiment) {
            this.tempExp.short_id = data.experiment.short_id
            this.tempExp.human_readable_name = data.experiment.human_readable_name;
            // making a copy of human_readable_name so it can be later compared
            this.tempExp_human_readable_name_COPY = data.experiment.human_readable_name;
            this.tempExp.user_urls = data.experiment.user_urls;
            this.getUsersFullNamesForExp()
          } else {
            this.tempPV.human_readable_name = data.process_variable.human_readable_name;
            // copy of pv name for later comparisson
            this.tempPV_human_readable_name_COPY = data.process_variable.human_readable_name
            this.tempPV.pv_string = data.process_variable.pv_string;
            // making a copy of pv_string and so it can be used as a title in the update dialog
            this.tempPV_pv_string_COPY = data.process_variable.pv_string;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    updateResource() {
      let reqUrl, reqData;
      if (this.isExperiment) {
        this.compareExpUsers()
        reqUrl = `${this.$General.APIExperiments()}/${this.$props.identifier}`;
        const hasExpNameChanged = this.tempExp.human_readable_name !== this.tempExp_human_readable_name_COPY
        reqData = { 
          ...(hasExpNameChanged && {human_readable_name: this.tempExp.human_readable_name}),
          ...(this.tempExp.users_to_add.length && {users_to_add: this.tempExp.users_to_add}),
          ...(this.tempExp.users_to_remove.length && {users_to_remove: this.tempExp.users_to_remove})
        };
      } else {
        reqUrl = `${this.$General.APIPVs()}/${this.$props.identifier}`;
        const hasPVStringChanged = this.tempPV.pv_string !== this.tempPV_pv_string_COPY
        const hasPVNameChanged = this.tempPV.human_readable_name !== this.tempPV_human_readable_name_COPY
        reqData = { 
          ...(hasPVStringChanged && {pv_string: this.tempPV.pv_string}),
          ...(hasPVNameChanged && {human_readable_name: this.tempPV.human_readable_name})
        };
      }
      if (!Object.keys(reqData).length) {
        this.showSheet('info', this.$General.GetString('sheetUpdateNoChanges'), false)
        this.confirmButtonDisabled = true
        return
      }
      this.reqLoading = true
      this.axiosConfig = {
        method: "PUT",
        url: reqUrl,
        headers: {
          "x-access-tokens": this.$General.GetLSSettings('Token'),
          "Content-Type": "application/json",
        },
        data: reqData,
      };
      this.$Axios(this.axiosConfig)
        .then(() => {
          const successMessage = this.isExperiment ? this.$General.GetString('sheetUpdateExpSuccess') : this.$General.GetString('sheetUpdatePVSuccess')
          this.showSheet("success", successMessage);
          this.reqLoading = false
        })
        .catch((e) => {
          e.response && this.showSheet("error", this.$General.sheetUpdateExpError(e.response.status));
          console.log(e);
          this.reqLoading = false
        });
    },
    getAllUserNames() {
      this.$Axios
        .get(this.$General.APIUsers(), this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
        .then(({data}) => {
          // console.log(data)
          this.allUserNames = data.users.map(user => {
            return {
              text: user.first_name + ' ' + user.last_name,
              value: user.user_id
            }
          });
        })
        .catch(e => console.log(e));
    },
    getUsersFullNamesForExp() {
      Promise.all(
        this.tempExp.user_urls.map(url => this.$Axios.get(this.$General.MainDomain + url, this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))))
        .then(resArray => resArray.forEach(({data}) => {
          this.expUserNames.push({
              value: data.user.user_id,
              text: data.user.first_name + ' ' + data.user.last_name
            });
            this.expUserNames_COPY.push({
              value: data.user.user_id,
              text: data.user.first_name + ' ' + data.user.last_name
            });
        }))
        .catch(e => console.log(e))
    },
    // Logic methods
    compareExpUsers() {
      const expUserIDs = this.expUserNames.map(el => el.value)
      const expUserIDs_COPY = this.expUserNames_COPY.map(el => el.value)
      let id

      // Users were added
      if (expUserIDs.length > expUserIDs_COPY.length) {
        // were the previous users removed?
        if (expUserIDs_COPY.length > 0) {
          for (id of expUserIDs_COPY) {
            expUserIDs.includes(id) ? expUserIDs.splice(expUserIDs.indexOf(id), 1) : this.tempExp.users_to_remove.push(id)
          }
        }
        this.tempExp.users_to_add = expUserIDs
      // Users were removed
      } else if (expUserIDs.length < expUserIDs_COPY.length) {
        for (id of expUserIDs_COPY) {
          !expUserIDs.includes(id) && this.tempExp.users_to_remove.push(id)
        }
      // The users count did not change
      } else {
        // add new users
        for (id of expUserIDs) {
          !expUserIDs_COPY.includes(id) && this.tempExp.users_to_add.push(id)
        }
        // remove old users
        for (id of expUserIDs_COPY) {
          !expUserIDs.includes(id) && this.tempExp.users_to_remove.push(id)
        }
      }
    },
    // UI methods
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
      setTimeout(() => {
        this.closeBottomSheet()
        this.$emit('reload-data')
        doCloseDialog && this.closeDialog() 
      }, time);
    },
    closeBottomSheet() {
      this.sheetAlert.open = false
      this.sheetAlert.type !== 'info' && this.closeDialog()
    },
    activateConfirmButton() {
      this.confirmButtonDisabled = false
    },
    closeDialog() {
      // waiting for the closing animation to finish
      setTimeout(() => {
        this.$emit("close-dialog");
      }, 200);
    },
  },
  mounted() {
    this.isUpdating && this.getResource()
  },
};
</script>

<style></style>