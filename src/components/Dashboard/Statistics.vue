<template>
  <v-container fluid>
    <v-row>
      <v-col cols="4">
        <Card :user="user" :settings="{ Title: $General.GetString('userscount'), Count: Statistics.Users.Count, Button: $General.GetString('manageusers'), Link: '/users', Color: 'info', Icon: 'mdi-account-group' }" />
      </v-col>
      <v-col cols="4">
        <Card :user="user" :settings="{ Title: $General.GetString('pvscount'), Count: Statistics.PVs.Count, Button: $General.GetString('managepvs'), Link: '/experiments-and-pvs', Color: 'success', Icon: 'mdi-playlist-edit' }" />
      </v-col>
      <v-col cols="4">
        <Card :user="user" :settings="{ Title: $General.GetString('experimentscount'), Count: Statistics.Experiments.Count, Button: $General.GetString('managepvs'), Link: '/Experiments-and-pvs', Color: 'warning', Icon: 'mdi-camera-document' }" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Card from './Card.vue';
export default {
  components: { Card },
  data: () => ({
    Statistics: {
      Users: {
        Items: [],
        Count: 0,
      },
      PVs: {
        Items: [],
        Count: 0,
      },
      Experiments: {
        Items: [],
        Count: 0,
      },
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
    GetData() {
      var AxiosConfigUsers = { method: 'GET', url: this.$General.APIUsers(), headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json' } };
      this.$Axios(AxiosConfigUsers)
        .then((DataResult) => {
          this.Statistics.Users.Items = DataResult.data.users;
          this.Statistics.Users.Count = this.Statistics.Users.Items.length;
          var UniqueExperiments = [];
          this.Statistics.Users.Items.forEach((Element) => {
            Element.experiment_urls.forEach((Exp) => {
              if (UniqueExperiments.indexOf(Exp) == -1) {
                UniqueExperiments.push(Exp);
              }
            });
          });
          this.Statistics.Experiments.Count = UniqueExperiments.length;
          console.log(UniqueExperiments);
        })
        .catch((Error) => {
          console.log(Error);
        });
    },
    GetPVS() {
      this.$Axios
        .get(this.$General.APIPVs(), this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
        .then((DataResult) => {
          this.Statistics.PVs.Items = DataResult.data.process_variables;
          this.Statistics.PVs.Count = this.Statistics.PVs.Items.length;
        })
        .catch((Error) => {
          console.log(Error);
        });
    },
  },
  mounted() {
    this.GetData();
    this.GetPVS();
  },
};
</script>
