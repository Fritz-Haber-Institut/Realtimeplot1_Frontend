<template>
  <v-container fluid>
    <v-card class="pa-5">
      <v-form ref="Login" lazy-validation autocomplete="off">
        <v-row>
          <v-col cols="12">
            <v-text-field autocomplete="new-username" filled prepend-inner-icon="mdi-email" label="Email" v-model="LoginValues.login_name" :rules="[(v) => !!v || $General.NoEmpty(), (v) => /.+@.+\..+/.test(v) || $General.WrongEmailFormat()]"></v-text-field>
            <v-text-field autocomplete="new-password" filled prepend-inner-icon="mdi-star" label="Password" v-model="LoginValues.password" :append-icon="GeneralValues.PasswordShow ? 'mdi-eye' : 'mdi-eye-off'" :rules="[(v) => !!v || $General.NoEmpty()]" :type="GeneralValues.PasswordShow ? 'text' : 'password'" @click:append="GeneralValues.PasswordShow = !GeneralValues.PasswordShow"></v-text-field>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <v-alert v-if="GeneralValues.AlertMessage != ''" color="error" dark>
              {{ GeneralValues.AlertMessage }}
            </v-alert>
            <v-btn color="info" dark block @click="Login()">Login </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'Login',

  data: () => ({
    GeneralValues: {
      PasswordShow: false,
      AlertMessage: '',
    },
    LoginValues: {},
  }),
  methods: {
    Login() {
      if (this.$refs.Login.validate()) {
        this.$Axios
          .post(this.$General.APILogin(), this.LoginValues, this.$General.GetHeaderValue())
          .then((LoginResult) => {
            console.log(LoginResult);
          })
          .catch((Error) => {
            console.log(Error);
            this.Alerts.Message = this.$General.WrongInfos();
          });
      }
    },
  },
  mounted() {},
};
</script>
