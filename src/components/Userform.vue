<template>
  <v-container>
    <v-card class="pa-5 mx-auto" :width="this.$vuetify.breakpoint.smAndDown ? '100%' : '50%'">
      <v-form ref="Submit" lazy-validation autocomplete="off">
        <v-row>
          <v-col cols="12">
            <v-text-field autocomplete="new-email" prepend-inner-icon="mdi-email" :label="$General.GetString('email')" v-model.trim="FormValues.email"></v-text-field>
            <v-text-field autocomplete="new-loginname" prepend-inner-icon="mdi-account" :label="$General.GetString('loginname')" v-model.trim="FormValues.login_name" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-text-field>
            <v-select
              prepend-inner-icon="mdi-badge-account-horizontal"
              label="User Role"
              v-model="FormValues.user_type"
              :items="[
                {
                  text: 'Admin',
                  value: 'Admin',
                },
                {
                  text: 'User',
                  value: 'User',
                },
              ]"
              item-text="text"
              item-value="value"
              :rules="[(v) => !!v || $General.GetString('noempty')]"
            ></v-select>
          </v-col>
          <v-col cols="6">
            <v-text-field autocomplete="new-first_name" :label="$General.GetString('firstname')" v-model.trim="FormValues.first_name" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field autocomplete="new-last_name" :label="$General.GetString('lastname')" v-model.trim="FormValues.last_name" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3" class="mx-auto">
            <v-btn color="info" dark block @click="Submit()">{{ this.$props.type == 'PUT' ? $General.GetString('update') : $General.GetString('new') }} </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" class="mx-auto">
            <v-alert class="d-flex justify-center" icon="mdi-check-circle-outline" rounded="lg" v-if="GeneralValues.AlertMessage.Message != ''" :color="GeneralValues.AlertMessage.Color" dark>
              {{ GeneralValues.AlertMessage.Message }}
            </v-alert>
          </v-col>
        </v-row>
      </v-form>
      <BottomSheetAlert :open="sheetAlert.open" :type="sheetAlert.type" @close-sheet="closeBottomSheet">
        {{ sheetAlert.text }}
      </BottomSheetAlert>
    </v-card>
  </v-container>
</template>

<script>
import BottomSheetAlert from './bottom-sheet-alert.vue';

export default {
  components: {
    BottomSheetAlert,
  },
  data: () => ({
    LocalStorage: {},
    GeneralValues: {
      PasswordShow: false,
      AlertMessage: {
        Message: '',
        Color: '',
      },
    },
    FormValues: {
      email: '',
      login_name: '',
      user_type: '',
      first_name: '',
      last_name: '',
    },
    sheetAlert: {
      open: false,
      type: 'sucess',
      text: '',
    },
  }),
  watch: {
    user(Value) {
      this.user = Value;
      this.CheckData();
    },
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
  props: {
    user: {
      type: Object,
      requred: true,
    },
    type: {
      type: String,
      requred: true,
    },
    target: {
      type: String,
      requred: true,
    },
  },
  methods: {
    ParentPassing(Value) {
      this.$emit('clicked', Value);
    },
    CheckData() {
      if (this.$props.type == 'PUT') {
        if (this.$props.target == '/current') {
          this.FillUserInfos(this.$props.user);
          this.FormValues.email = this.$props.user == null ? '' : this.$props.user.email;
          this.FormValues.login_name = this.$props.user == null ? '' : this.$props.user.login_name;
          this.FormValues.user_type = this.$props.user == null ? '' : this.$props.user.user_type;
          this.FormValues.first_name = this.$props.user == null ? '' : this.$props.user.first_name;
          this.FormValues.last_name = this.$props.user == null ? '' : this.$props.user.last_name;
        } else {
          const AxiosConfig = { method: 'GET', url: this.$General.APIUsers() + this.$props.target, headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json' }, data: this.FormValues };
          this.$Axios(AxiosConfig)
            .then((UserInfos) => {
              this.FillUserInfos(UserInfos.data.user);
            })
            .catch((Error) => {
              console.log(Error);
            });
        }
      }
    },
    FillUserInfos(UserInfos) {
      this.FormValues.email = UserInfos == null ? '' : UserInfos.email;
      this.FormValues.login_name = UserInfos == null ? '' : UserInfos.login_name;
      this.FormValues.user_type = UserInfos == null ? '' : UserInfos.user_type;
      this.FormValues.first_name = UserInfos == null ? '' : UserInfos.first_name;
      this.FormValues.last_name = UserInfos == null ? '' : UserInfos.last_name;
    },
    Submit() {
      if (this.$refs.Submit.validate()) {
        const AxiosConfig = { method: this.$props.type, url: this.$General.APIUsers() + this.$props.target, headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json' }, data: this.FormValues };
        this.$Axios(AxiosConfig)
          .then(() => {
            this.GeneralValues.AlertMessage.Message = this.$General.GetString('success');
            this.GeneralValues.AlertMessage.Color = 'success';
            this.ParentPassing(this.GeneralValues.AlertMessage);
          })
          .catch((Error) => {
            console.log(Error);
            this.GeneralValues.AlertMessage.Message = this.$General.GetString('wronginfos3');
            this.GeneralValues.AlertMessage.Color = 'error';
          });
      }
    },
    // UI methods
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
      setTimeout(() => {
        this.closeBottomSheet()
      }, time);
    },
    closeBottomSheet() {
      this.sheetAlert.open = false
    }
  },
  mounted() {
    this.CheckData();
    setInterval(() => {
      this.LocalStorage = this.$General.GetLSSettings();
    }, 100);
  },
};
</script>
