<template>
  <v-container fluid>
    <v-card class="pa-5">
      <v-form ref="Submit" lazy-validation autocomplete="off">
        <v-row>
          <v-col cols="12">
            <v-text-field autocomplete="new-email" filled prepend-inner-icon="mdi-email" :label="$General.GetString('email')" v-model="FormValues.email"></v-text-field>
            <v-text-field autocomplete="new-loginname" filled prepend-inner-icon="mdi-star" :label="$General.GetString('loginname')" v-model="FormValues.login_name" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-text-field>
            <v-select
              filled
              prepend-inner-icon="mdi-key"
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
            <v-text-field autocomplete="new-first_name" filled prepend-inner-icon="mdi-star" :label="$General.GetString('firstname')" v-model="FormValues.first_name" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field autocomplete="new-last_name" filled prepend-inner-icon="mdi-star" :label="$General.GetString('lastname')" v-model="FormValues.last_name" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-text-field>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <v-alert icon="mdi-check-circle-outline" rounded="lg" v-if="GeneralValues.AlertMessage.Message != ''" :color="GeneralValues.AlertMessage.Color" dark>
              {{ GeneralValues.AlertMessage.Message }}
            </v-alert>
            <v-btn color="info" dark block @click="Submit()">{{ this.$props.type == 'PUT' ? $General.GetString('update') : $General.GetString('new') }} </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
export default {
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
          var AxiosConfig = { method: 'GET', url: this.$General.APIUsers() + this.$props.target, headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json' }, data: this.FormValues };
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
        var AxiosConfig = { method: this.$props.type, url: this.$General.APIUsers() + this.$props.target, headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json' }, data: this.FormValues };
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
  },
  mounted() {
    this.CheckData();
    setInterval(() => {
      this.LocalStorage = this.$General.GetLSSettings();
    }, 100);
  },
};
</script>
