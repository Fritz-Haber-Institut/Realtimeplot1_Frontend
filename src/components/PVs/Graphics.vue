<template>
  <v-container fluid>
    <v-card class="pa-5">
      <v-row>
        <v-col cols="6">
          <v-text-field v-model="ChartSettings.TimeIntervalParsed.SinceDate" type="date" />
          <v-text-field v-model="ChartSettings.TimeIntervalParsed.SinceTime" type="time" />
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="ChartSettings.TimeIntervalParsed.UntilDate" type="date" />
          <v-text-field v-model="ChartSettings.TimeIntervalParsed.UntilTime" type="time" />
        </v-col>
        <v-col cols="12">
          <v-select filled prepend-inner-icon="mdi-key" v-model="ChartSettings.PVString" :items="ChartSettings.ExperimentsList" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-select>
          <v-btn block color="info" @click="UpdateData()">
            <v-icon>mdi-update</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <v-divider class="my-5" />
    <v-card class="pa-5">
      <div id="chart">
        <apexchart width="100%" type="area" :options="options" :series="series"> </apexchart>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    ChartSettings: {
      TimeInterval: {},
      TimeIntervalParsed: {},
      Experiment: '',
      ExperimentsList: [],
    },
    options: {
      type: 'line',
      chart: {
        id: 'vuechart-example',
      },
      xaxis: {
        categories: [],
      },
      title: {
        text: '',
      },
    },
    series: [
      {
        name: 'series-1',
        data: [],
      },
    ],
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
    UpdateData() {
      var NewSinceDate = this.$Moment(String(this.ChartSettings.TimeIntervalParsed.SinceDate)).format('YYYY-MM-DD') + ' ' + this.ChartSettings.TimeIntervalParsed.SinceTime + ':00';
      var NewUntilDate = this.$Moment(String(this.ChartSettings.TimeIntervalParsed.UntilDate)).format('YYYY-MM-DD') + ' ' + this.ChartSettings.TimeIntervalParsed.UntilTime + ':00';
      window.location.href = '/dashboard?pvstring=' + this.ChartSettings.PVString + '&since=' + NewSinceDate + '&until=' + NewUntilDate;
    },
    PostPPBData() {
      var PVStrings = ['PPB:VmeCrateAfm:FanSpeed1', 'PPB:VmeCrateAfm:IM12', 'PPB:VmeCrateAfm:IP12', 'PPB:VmeCrateAfm:IP3', 'PPB:VmeCrateAfm:IP5', 'PPB:VmeCrateAfm:Temp1', 'PPB:VmeCrateAfm:Temp2', 'PPB:VmeCrateAfm:Temp3', 'PPB:VmeCrateAfm:VM12', 'PPB:VmeCrateAfm:VP12', 'PPB:VmeCrateAfm:VP3', 'PPB:VmeCrateAfm:VP5'];
      PVStrings.forEach((Eelement) => {
        var FormValues = {
          pv_string: Eelement,
          human_readable_name: 'Desc : ' + Eelement,
        };
        var AxiosConfig = { method: 'POST', url: this.$General.APIPVs(), headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json' }, data: FormValues };
        this.$Axios(AxiosConfig)
          .then(() => {})
          .catch((Error) => {
            console.log(Error);
          });
      });
    },
    GetData() {
      this.ChartSettings.TimeInterval.since = this.$route.query.since;
      this.ChartSettings.TimeInterval.until = this.$route.query.until;

      this.ChartSettings.TimeIntervalParsed.SinceDate = this.$Moment(String(this.ChartSettings.TimeInterval.since)).format('YYYY-MM-DD');
      this.ChartSettings.TimeIntervalParsed.SinceTime = this.$Moment(String(this.ChartSettings.TimeInterval.since)).format('HH:mm');

      this.ChartSettings.TimeIntervalParsed.UntilDate = this.$Moment(String(this.ChartSettings.TimeInterval.until)).format('YYYY-MM-DD');
      this.ChartSettings.TimeIntervalParsed.UntilTime = this.$Moment(String(this.ChartSettings.TimeInterval.until)).format('HH:mm');

      this.ChartSettings.PVString = this.$route.query.pvstring;
      this.ChartSettings.ShortID = this.$route.query.pvstring.split(':')[0];
      this.ChartSettings.Var1 = this.$route.query.pvstring.split(':')[1];
      this.ChartSettings.Var2 = this.$route.query.pvstring.split(':')[2];

      var AxiosConfig = { method: 'POST', url: this.$General.APIData() + this.$route.query.pvstring.split(':')[0], headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json;charset=UTF-8' }, data: this.ChartSettings.TimeInterval };
      this.$Axios(AxiosConfig)
        .then((DataResult) => {
          var Labels = [];
          var Series = [];
          DataResult.data.data.experiment.process_variable_urls.forEach((Element) => {
            this.ChartSettings.ExperimentsList.push(Element.split('/')[3]);
          });
          DataResult.data.data.process_variables_data[this.ChartSettings.PVString].forEach((Element) => {
            Series.push(Element.data.toFixed(2));
            Labels.push(this.$Moment(String(Element.time)).format('DD.MM.YYYY, HH:mm:ss'));
          });
          this.options = {
            title: {
              text: this.ChartSettings.PVString,
            },
            labels: Labels,
          };
          this.series[0] = {
            data: Series,
          };
        })
        .catch((Error) => {
          console.log(Error);
        });
    },
  },
  mounted() {
    // this.PostPPBData();
    this.GetData();
  },
};
</script>