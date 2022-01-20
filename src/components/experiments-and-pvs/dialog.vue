<template>
  <v-dialog v-model="isDialogOpen" max-width="500px">
    <v-card>
      <v-card-title>
        <!-- <span class="headline">{{ formTitle }}</span> -->
        {{ getDialogTitle }}
      </v-card-title>
      <v-card-text>
        <v-form lazy-validation autocomplete="off">
          <v-row>
            <v-col cols="12" v-if="isExperiment">
              <v-text-field
                v-if="isExperiment"
                label="Name"
                v-model="tempExp.human_readable_name"
              />
            </v-col>
            <v-col cols="6" v-if="!isExperiment">
              <v-text-field label="PV String" v-model="tempPV.pv_string" />
            </v-col>
            <v-col cols="6" v-if="!isExperiment">
              <v-text-field
                label="Name (optional)"
                v-model="tempPV.human_readable_name"
              />
            </v-col>
          </v-row>
          <v-row v-if="isExperiment">
            <v-col cols="12">
              <!-- no-data-text="There are no users assigned to this experiment" -->
              <v-combobox
                v-model="expUserNames"
                :items="allUserNames"
                label="Assigned users"
                hide-no-data
                multiple
                chips
                @focus="getAllUserNames"
              >
                <template v-slot:selection="data">
                  <v-chip
                    :key="JSON.stringify(data.item)"
                    v-bind="data.attrs"
                    :input-value="data.selected"
                    :disabled="data.disabled"
                    @click:close="data.parent.selectItem(data.item)"
                  >
                    <v-avatar class="accent white--text" left>
                      <v-icon>mdi-account-circle</v-icon>
                    </v-avatar>
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
        <v-btn color="blue darken-1" text @click.native="closeDialog"
          >Cancel</v-btn
        >
        <v-btn
          v-if="$props.method === 'POST'"
          color="blue darken-1"
          text
          @click.native="createNewPV"
          >Create</v-btn
        >
        <v-btn v-else color="blue darken-1" text @click.native="updateResource"
          >Update</v-btn
        >
      </v-card-actions>
    </v-card>
    <v-bottom-sheet v-model="isSheetOpen" width="20%">
      <v-sheet class="text-center rounded" height="55px">
        <v-alert full-width height="100%" :type="sheetAlert.success">{{
          sheetAlert.text
        }}</v-alert>
      </v-sheet>
    </v-bottom-sheet>
  </v-dialog>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
      default: "POST",
      validator: (val) => ["POST", "PUT", "DELETE"].includes(val),
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
      tempPV: {
        pv_string: "",
        human_readable_name: "", // optional
      },
      emptyExp: {
        short_id: "",
        human_readable_name: "",
        user_urls: [],
        users_to_remove: [],
        users_to_add: []
      },
      emptyPV: {
        pv_string: "",
        human_readable_name: "",
      },
      axiosConfig: {},
      allUserNames: [],
      expUserNames: [],
      expUserNames_COPY: [],
      isSheetOpen: false,
      sheetAlert: {
        type: "success",
        text: "",
      },
    };
  },
  computed: {
    isExperiment() {
      return this.$props.type === "exp";
    },
    isUpdating() {
      return this.$props.method === "PUT";
    },
    isDialogOpen: {
      get() {
        return this.$props.open;
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
        return "Update PV " + this.tempPV.pv_string;
      else return "Create PV";
    },
  },
  methods: {
    // HTTP-Requests methods
    createNewPV() {
      this.axiosConfig = {
        method: "POST",
        url: this.$General.APIPVs(),
        headers: {
          "x-access-tokens": this.$General.GetLSSettings().Token,
          "Content-Type": "application/json",
        },
        data: this.tempPV,
      };
      this.$Axios(this.axiosConfig)
        .then((res) => {
          console.log("createNewPV");
          console.log(res.data);
          this.showSheet("success", this.$General.sheetNewPVSuccess);
        })
        .catch((e) => {
          console.log(e);
          this.showSheet("error", this.$General.sheetNewPVError(e.response.status));
        });
    },
    getResource() {
      const reqUrl = `${this.isExperiment ? this.$General.APIExperiments() : this.$General.APIPVs()}/${this.$props.identifier}`
      this.$Axios.get(reqUrl, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
        .then((res) => {
          if (this.isExperiment) {
            this.tempExp.short_id = res.data.experiment.short_id;
            this.tempExp.human_readable_name =
              res.data.experiment.human_readable_name;
            this.tempExp.user_urls = res.data.experiment.user_urls;
            this.getExpUserNames()
          } else {
            this.tempPV.human_readable_name =
              res.data.process_variable.human_readable_name;
            this.tempPV.pv_string = res.data.process_variable.pv_string;
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
        reqData = this.tempExp;
        for (let prop in reqData) {
          (!reqData[prop] || reqData[prop].length === 0 || prop === 'short_id' || prop === 'user_urls') && delete reqData[prop]
        }
      } else {
        reqUrl = `${this.$General.APIPVs()}/${this.$props.identifier}`;
        reqData = this.tempPV;
      }

      this.axiosConfig = {
        method: "PUT",
        url: reqUrl,
        headers: {
          "x-access-tokens": this.$General.GetLSSettings().Token,
          "Content-Type": "application/json",
        },
        data: reqData,
      };

      this.$Axios(this.axiosConfig)
        .then(res => {
          console.log("updateResource");
          console.log(res.data);
          this.showSheet("success", this.$General.sheetUpdateExpSuccess);
        })
        .catch((e) => {
          console.log(e);
          this.showSheet("error", this.$General.sheetUpdateExpError(e.response.status));
        });
    },
    getAllUserNames() {
      this.$Axios
        .get(
          this.$General.APIUsers(),
          this.$General.GetHeaderValue(
            this.$General.GetLSSettings().Token,
            true
          )
        )
        .then((res) => {
          // console.log(res.data)
          this.allUserNames = res.data.users.map(user => {
            return {
              text: user.first_name + ' ' + user.last_name,
              value: user.user_id
            }
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    getExpUserNames() {
      // console.log(this.tempExp.user_urls)
      for (let userUrl of this.tempExp.user_urls) {
        // console.log('expUserNames loop')
        this.$Axios.get(this.$General.MainDomain + userUrl, this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
          .then((res) => {
            console.log('expUserNames')
            console.log(res.data);
            this.expUserNames.push({
              value: res.data.user.user_id,
              text: res.data.user.first_name + ' ' + res.data.user.last_name
            });
            // this.expUserNames.push(res.data.user.first_name + ' ' + res.data.user.last_name)
          })
          .catch((e) => {
            console.log(e);
          });
      }
      this.expUserNames_COPY = JSON.parse(JSON.stringify(this.expUserNames))
    },
    // Logic methods
    compareExpUsers() {
      const expUserIDs = this.expUserNames.map(el => el.value)
      const expUserIDs_COPY = this.expUserNames_COPY.map(el => el.value)
      console.log('expUserIDs')
      console.log(expUserIDs)
      console.log('expUserIDs_COPY')
      console.log(expUserIDs_COPY)
      let id

      if (expUserIDs.length > expUserIDs_COPY.length) {
        // were the previous users removed?
        // let tempArray = []
        // tempArray.push(expUserIDs)
        if (expUserIDs_COPY.length > 0) {
          for (id of expUserIDs_COPY) {
            expUserIDs.includes(id) ? expUserIDs.splice(expUserIDs.indexOf(id), 1) : this.tempExp.users_to_remove.push(id)
          }
        }
        this.tempExp.users_to_add = expUserIDs
      } else if (expUserIDs.length < expUserIDs_COPY.length) {
        for (id of expUserIDs_COPY) {
          !expUserIDs.includes(id) && this.tempExp.users_to_remove.push(id)
        }
      } else {
        // if the arrays are not equal
        if (expUserIDs.join('') !== expUserIDs_COPY.join('')) {
          // add new users
          for (id of expUserIDs) {
            !expUserIDs_COPY.includes(id) && this.tempExp.users_to_add.push(id)
          }
          // remove old users
          for (id of expUserIDs_COPY) {
            !expUserIDs_COPY.includes(id) && this.tempExp.users_to_remove.push(id)
          }
        }
      }
    },
    // UI methods
    showSheet(type, text) {
      this.sheetAlert.type = type;
      this.sheetAlert.text = text;
      this.isSheetOpen = true;
      setTimeout(() => {
        this.isSheetOpen = false;
      }, 750);
      this.closeDialog();
    },
    closeDialog() {
      // if (dialogType === 'new') {
      //   this.dialogNew = false;
      // } else {
      //   this.dialogUpdate = false;
      //   this.isUpdateUserButtonActive = false;
      // }
      setTimeout(() => {
        this.$emit("close-dialog");
        this.$nextTick(() => {
          this.isExperiment ? (this.tempExp = Object.assign({}, this.emptyExp)) :  (this.tempPV = Object.assign({}, this.emptyPV));
          // this.sheetAlert.isVisible = false;
        });
      }, 200);
    },
  },
  mounted() {
    if (this.$props.method === "PUT") {
      this.getResource();
    } else if (this.$props.method === 'DELETE') {
      // this.getResource();
      this.deleteResource()
    }
  },
};
</script>

<style></style>