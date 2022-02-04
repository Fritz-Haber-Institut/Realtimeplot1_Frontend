<template>
  <v-card class="" :width="this.$vuetify.breakpoint.smAndDown ? '100%' : '100%'">
    <v-card-title>{{ getDialogTitle }}</v-card-title>
    <v-card-text>
      <v-form ref="Submit" lazy-validation autocomplete="off">
        <v-row>
          <v-col cols="12">
            <v-text-field autocomplete="new-email" prepend-inner-icon="mdi-email" :label="$General.GetString('email')" v-model.trim="userData.email" :rules="emailRules" @keydown="activateConfirmButton" />
            <v-text-field autocomplete="new-loginname" prepend-inner-icon="mdi-account" :label="$General.GetString('loginname')" v-model.trim="userData.login_name" :rules="[(v) => !!v || $General.GetString('noempty')]" @keydown="activateConfirmButton" />
            <v-text-field v-if="$props.type == 'PUT'" autocomplete="new-password" prepend-inner-icon="mdi-key" :label="$General.GetString('passwordcanbeempty')" v-model.trim="userData.password" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'" @click:append="showPassword = !showPassword" @keydown="activateConfirmButton" />
            <v-select
              v-if="currentUser.user_type == 'Admin'"
              prepend-inner-icon="mdi-badge-account-horizontal"
              label="User Role"
              v-model="userData.user_type"
              :items="[
                { text: 'Admin', value: 'Admin' },
                { text: 'User', value: 'User' },
              ]"
              item-text="text"
              item-value="value"
              :rules="[(v) => !!v || $General.GetString('noempty')]"
            ></v-select>
          </v-col>
          <v-col cols="6">
            <v-text-field autocomplete="new-first_name" :label="$General.GetString('firstname')" v-model.trim="userData.first_name" :rules="[(v) => !!v || $General.GetString('noempty')]" @keydown="activateConfirmButton" />
          </v-col>
          <v-col cols="6">
            <v-text-field autocomplete="new-last_name" :label="$General.GetString('lastname')" v-model.trim="userData.last_name" :rules="[(v) => !!v || $General.GetString('noempty')]" @keydown="activateConfirmButton" />
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-card-actions>
            <ButtonWithLoading color="info" @clicked="Submit" :disabled="confirmButtonDisabled" :loading="reqLoading">
              {{ this.$props.type == 'PUT' ? $General.GetString('update') : $General.GetString('new') }}
            </ButtonWithLoading>
            <!-- <v-btn color="info" dark @click="Submit()" max-width="200px">{{ this.$props.type == 'PUT' ? $General.GetString('update') : $General.GetString('new') }} </v-btn> -->
          </v-card-actions>
        </v-row>
        <v-row>
          <v-col cols="6" class="mx-auto">
            <v-alert class="d-flex justify-center" icon="mdi-check-circle" rounded="lg" v-if="GeneralValues.AlertMessage.Message != ''" :color="GeneralValues.AlertMessage.Color" dark>
              {{ GeneralValues.AlertMessage.Message }}
            </v-alert>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <BottomSheetAlert :open="sheetAlert.open" :type="sheetAlert.type" @close-sheet="closeBottomSheet">
      {{ sheetAlert.text }}
    </BottomSheetAlert>
  </v-card>
</template>

<script>
import ButtonWithLoading from './button-with-loading.vue'
import BottomSheetAlert from '../components/bottom-sheet-alert.vue'
import CryptoJS from 'crypto-js'

export default {
  components: { 
    ButtonWithLoading,
    BottomSheetAlert
  },
  props: {
    type: {
      type: String,
      requred: true,
      validator: val => ["POST", "PUT"].includes(val)
    },
    target: {
      type: String,
      requred: true,
    },
  },
  data: () => ({
    showPassword: false,
    GeneralValues: {
      AlertMessage: {
        Message: '',
        Color: '',
      },
    },
    currentUser: {},
    userData: {
      email: '',
      login_name: '',
      user_type: '',
      first_name: '',
      last_name: '',
      password: '',
    },
    userData_COPY: {},
    reqLoading: false,
    confirmButtonDisabled: true,
    sheetAlert: {
      open: false,
      type: 'sucess',
      text: "",
    },
    credentialsChanged: false
  }),
  watch: {
    type(Value) {
      if (Value) {
        this.type = Value;
      }
    },
    target(Value) {
      if (Value) {
        this.target = Value;
      }
    },
  },
  computed: {
    getDialogTitle() {
      if (this.type === 'PUT') {
        return this.target === '/current' ? '' : 'Update user ' + this.userData_COPY.login_name
      } else {
        return 'Create new user'
      }
    },
    emailRules() {
      const rules = [(v) => this.$General.emailRegex.test(v) || this.$General.GetString('wrongemailformat')];
      return rules
    },
  },
  methods: {
    getCurrentUser() {
      this.$Axios
      .get(this.$General.APIUsers() + '/current', this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
      .then(({data}) => {
        this.currentUser = data.user
      })
      .catch(e => console.log(e))
    },
    CheckData() {
      this.$Axios
      .get(this.$General.APIUsers() + this.$props.target, this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
      .then(({data}) => {
        this.userData = data.user
        this.userData_COPY = { ...this.userData }
      })
    },
    FillUserInfos(UserInfos) {
      this.userData.email = UserInfos == null ? '' : UserInfos.email;
      this.userData.login_name = UserInfos == null ? '' : UserInfos.login_name;
      this.userData.user_type = UserInfos == null ? '' : UserInfos.user_type;
      this.userData.first_name = UserInfos == null ? '' : UserInfos.first_name;
      this.userData.last_name = UserInfos == null ? '' : UserInfos.last_name;
    },
    Submit() {
      if (this.$refs.Submit.validate()) {
        let reqData = {}
        for (let prop in this.userData) {
          const putCheck = this.type === 'PUT' && this.userData[prop] !== this.userData_COPY[prop]
          const postCheck = this.type === 'POST' && !!this.userData[prop]
          if (putCheck || postCheck) {
            reqData[prop] = this.userData[prop]
          }
        }

        if (!Object.keys(reqData).length || reqData.password === '' || reqData.password === this.getUserPassword()) {
          this.showSheet('info', this.$General.GetString(this.type === 'PUT' ? 'sheetUpdateNoChanges' : 'sheetNewNoValues'), false)
          this.confirmButtonDisabled = true
          return
        }

        if (reqData.password || reqData.login_name) {
          this.credentialsChanged = true
        }
      
        this.reqLoading = true

        const AxiosConfig = {
          method: this.$props.type,
          url: this.$General.APIUsers() + this.$props.target,
          headers: {
            'x-access-tokens': this.$General.GetLSSettings('Token'),
            'Content-Type': 'application/json',
            ...(this.userData.user_type === 'User' && {'Authorization': 'Basic ' + window.btoa(this.userData.login_name + ':' + this.getUserPassword())})
          },
          data: reqData,
        }
        
        this.$Axios(AxiosConfig)
          .then(({data}) => {
            this.reqLoading = false
            let successMessage = ''
            let time
            if (this.$props.type === 'PUT' && this.target === '/current' && this.credentialsChanged) {
              successMessage = this.$General.GetString('sheetUpdatePasswordUserSuccess')
              time = 4000
            } else if (this.$props.type === 'PUT') {
              successMessage = this.$General.GetString('sheetUpdateUserSuccess')
            } else {
              successMessage = this.$General.sheetNewUserSuccess(data.user.login_name, data.user.temporary_password)
              time = 10000
            }
            this.showSheet("success", successMessage, true, time)
          })
          .catch((e) => {
            if (e.response) {
              this.showSheet("error", this.$props.type === 'PUT' ? this.$General.sheetUpdateUserError(e.response.status) : this.$General.sheetCreateUserError(e.response.status))
            }
            this.reqLoading = false
          });
      }
    },
    getUserPassword() {
      const encPassword = this.$General.GetLSSettings(this.$General.LSSpecialKey)
      const bytes = CryptoJS.AES.decrypt(encPassword, this.$General.LSSpecialValue)
      return bytes.toString(CryptoJS.enc.Utf8)
    },
    // UI Methods
    activateConfirmButton() {
      this.confirmButtonDisabled = false
    },
    showSheet(type, text, doCloseDialog = true, customTime) {
      this.sheetAlert.type = type;
      this.sheetAlert.text = text;
      this.sheetAlert.open = true;
      let time
      if (customTime) {
        time = customTime
      } else if (type === 'error') {
        time = 4000
      } else if (!doCloseDialog) {
        time = 3000
      } else {
        time = 1000
      }
      this.target !== '/current' && this.$emit('reload-data')
      setTimeout(() => {
        this.closeBottomSheet()
        this.credentialsChanged && this.$emit('do-logout')
        if (this.target !== '/current' && doCloseDialog) {
          this.closeDialog()
        }
      }, time);
    },
    closeBottomSheet() {
      this.sheetAlert.open = false
      this.sheetAlert.type !== 'info' && this.closeDialog()
    },
    closeDialog() {
      // waiting for the closing animation to finish
      setTimeout(() => {
        this.$emit('close-dialog');
      }, 200);
    },
  },
  mounted() {
    this.$props.type == 'PUT' && this.CheckData()
    this.getCurrentUser()
    this.getUserPassword()
  },
};
</script>