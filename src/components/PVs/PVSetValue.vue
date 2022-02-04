<template>
  <v-container fluid>
    <v-card>
      <v-card-title>Manually set a new PV value</v-card-title>
      <v-card-text>
        <v-form ref="Submit" lazy-validation autocomplete="off">
          <v-row>
            <v-col cols="9">
              <v-text-field autocomplete="new-value" prepend-inner-icon="mdi-star" label="New value" v-model="FormValues.value" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-text-field>
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="9">
              <v-alert icon="mdi-check-circle" rounded="lg" v-if="GeneralValues.AlertMessage.Message != ''" :color="GeneralValues.AlertMessage.Color" dark>
                {{ GeneralValues.AlertMessage.Message }}
              </v-alert>
              <v-btn block rounded color="secondary" dark @click="Submit()">Send</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    GeneralValues: {
      AlertMessage: {
        Message: '',
        Color: '',
      },
    },
    FormValues: {
      value: '',
    },
  }),
  watch: {
    user(Value) {
      this.user = Value;
    },
  },
  props: {
    user: {
      type: Object,
      requred: true,
    },
  },
  methods: {
    Submit() {
      if (this.$refs.Submit.validate()) {
        var AxiosConfig = { method: 'PUT', url: this.$General.APIPVSetValue() + this.$route.query.pvstring, headers: { 'x-access-tokens': this.$General.GetLSSettings('Token'), 'Content-Type': 'application/json' }, data: this.FormValues };
        this.$Axios(AxiosConfig)
          .then((Result) => {
            this.GeneralValues.AlertMessage.Message = Result.data;
            this.GeneralValues.AlertMessage.Color = 'success';
          })
          .catch((Error) => {
            console.log(Error);
            this.GeneralValues.AlertMessage.Message = Error.response.data.errors[0];
            this.GeneralValues.AlertMessage.Color = 'error';
          });
      }
    },
  },
  mounted() {

  },
};
</script>
