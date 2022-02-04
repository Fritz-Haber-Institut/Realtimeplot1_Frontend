<template>
  <v-container fluid>
    <v-card class="pa-5">
      <v-form ref="Submit" lazy-validation autocomplete="off">
        <v-row>
          <v-col cols="12">
            <v-text-field autocomplete="new-pvstring" prepend-inner-icon="mdi-star" :label="$General.GetString('pvstring')" v-model="FormValues.pv_string" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-text-field>
            <v-text-field autocomplete="new-humanreadablename" prepend-inner-icon="mdi-star" :label="$General.GetString('humanreadablename')" v-model="FormValues.human_readable_name"></v-text-field>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <v-alert icon="mdi-check-circle" rounded="lg" v-if="GeneralValues.AlertMessage.Message != ''" :color="GeneralValues.AlertMessage.Color" dark>
              {{ GeneralValues.AlertMessage.Message }}
            </v-alert>
            <v-btn color="info" dark block @click="Submit()">{{ $General.GetString('new') }} </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    // LocalStorage: {},
    GeneralValues: {
      PasswordShow: false,
      AlertMessage: {
        Message: '',
        Color: '',
      },
    },
    FormValues: {
      pv_string: '',
      human_readable_name: '',
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
        var AxiosConfig = { method: 'POST', url: this.$General.APIPVs(), headers: { 'x-access-tokens': this.$General.GetLSSettings('Token'), 'Content-Type': 'application/json' }, data: this.FormValues };
        this.$Axios(AxiosConfig)
          .then(() => {
            this.GeneralValues.AlertMessage.Message = this.$General.GetString('success');
            this.GeneralValues.AlertMessage.Color = 'success';
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
    // setInterval(() => {
    //   this.LocalStorage = this.$General.GetLSSettings();
    // }, 100);
  },
};
</script>
