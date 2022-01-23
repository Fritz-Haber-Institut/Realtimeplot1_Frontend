<template>
  <v-container fluid>
    <v-card class="pa-5">
      <v-form ref="Login" lazy-validation autocomplete="off">
        <v-row>
          <v-col cols="12">
            <v-text-field autocomplete="new-username" filled prepend-inner-icon="mdi-star" :label="$General.GetString('loginname')" v-model="LoginValues.username" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-text-field>
            <v-text-field autocomplete="new-password" filled prepend-inner-icon="mdi-star" :label="$General.GetString('password')" v-model="LoginValues.password" :append-icon="GeneralValues.PasswordShow ? 'mdi-eye' : 'mdi-eye-off'" :rules="[(v) => !!v || $General.GetString('noempty')]" :type="GeneralValues.PasswordShow ? 'text' : 'password'" @click:append="GeneralValues.PasswordShow = !GeneralValues.PasswordShow"></v-text-field>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <v-alert icon="mdi-check-circle-outline" rounded="lg" v-if="GeneralValues.AlertMessage.Message != ''" :color="GeneralValues.AlertMessage.Color" dark>
              {{ GeneralValues.AlertMessage.Message }}
            </v-alert>
            <v-btn color="info" dark block @click="Login()">{{ $General.GetString('login') }} </v-btn>
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
    LoginValues: {
      username: '',
      password: '',
    },
  }),
  methods: {
    initiateLoginOnEnterKey(e) {
      if (e.key === 'Enter' && this.LoginValues.username !== '' && this.LoginValues.password !== '') {
        this.Login();
      }
    },
    Login() {
      if (this.$refs.Login.validate()) {
        this.$Axios
          .post(this.$General.APILogin(), this.LoginValues, this.$General.GetHeaderValue(window.btoa(this.LoginValues.username + ':' + this.LoginValues.password), false))
          .then((LoginResult) => {
            console.log(LoginResult);
            this.LocalStorage.Token = LoginResult.data.access_token;
            this.LocalStorage.preferred_language = 'en';            
            this.$General.SetLSSettings(this.LocalStorage);
            this.GeneralValues.AlertMessage.Message = this.$General.GetString('successwithtimer').replace('@@', '2');
            this.GeneralValues.AlertMessage.Color = 'success';
            setTimeout(() => {
              this.$General.ReloadPage('/experiments-and-pvs');
            }, 2000);
          })
          .catch((Error) => {
            console.log(Error);
            this.GeneralValues.AlertMessage.Message = this.$General.GetString('wronginfos');
            this.GeneralValues.AlertMessage.Color = 'error';
          });
      }
    },
  },
  mounted() {
    setInterval(() => {
      this.LocalStorage = this.$General.GetLSSettings();
    }, 100);
    document.addEventListener('keydown', this.initiateLoginOnEnterKey);
  },
};
</script>