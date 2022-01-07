<template>
  <v-container fluid>
    <v-card class="pa-5">
      <v-form ref="Submit" lazy-validation autocomplete="off">
        <v-row>
          <v-col cols="6">
            <v-text-field autocomplete="new-first_name" filled prepend-inner-icon="mdi-star" label="Firstname" v-model="FormValues.first_name" :rules="[(v) => !!v || $General.NoEmpty()]"></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field autocomplete="new-last_name" filled prepend-inner-icon="mdi-star" label="Lastname" v-model="FormValues.last_name" :rules="[(v) => !!v || $General.NoEmpty()]"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field autocomplete="new-email" filled prepend-inner-icon="mdi-email" label="Email" v-model="FormValues.email" :rules="[(v) => !!v || $General.NoEmpty(), (v) => /.+@.+\..+/.test(v) || $General.WrongEmailFormat()]"></v-text-field>
            <v-text-field autocomplete="new-username" filled prepend-inner-icon="mdi-star" label="Login Name" v-model="FormValues.login_name" :rules="[(v) => !!v || $General.NoEmpty()]"></v-text-field>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <v-alert v-if="GeneralValues.AlertMessage.Message != ''" :color="GeneralValues.AlertMessage.Color" dark>
              {{ GeneralValues.AlertMessage.Message }}
            </v-alert>
            <v-btn color="info" dark block @click="Submit()">{{ $router.currentRoute.meta.button }} </v-btn>
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
      login_name: '',
      email: '',
      first_name: '',
      last_name: '',
    },
  }),
  watch: {
    user() {
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
    CheckData() {
      if (this.$props.target == 'current') {
        this.FormValues.login_name = this.$props.user.login_name;
        this.FormValues.email = this.$props.user.email;
        this.FormValues.first_name = this.$props.user.first_name;
        this.FormValues.last_name = this.$props.user.last_name;
      }
    },
    Submit() {
      if (this.$refs.Submit.validate()) {
        var AxiosConfig = {
          method: this.$props.type,
          url: this.$General.APIUsers() + '/' + this.$props.target,
          headers: {
            'x-access-tokens': this.$General.GetLSSettings().Token,
            'Content-Type': 'application/json',
          },
          data: this.FormValues,
        };
        this.$Axios(AxiosConfig)
          .then(() => {
            this.GeneralValues.AlertMessage.Message = this.$General.Success();
            this.GeneralValues.AlertMessage.Color = 'success';
            setTimeout(() => {
              this.$General.ReloadPage();
            }, 2000);
          })
          .catch((Error) => {
            console.log(Error);
            this.GeneralValues.AlertMessage.Message = this.$General.WrongInfos3();
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
