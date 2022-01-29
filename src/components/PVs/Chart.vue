<template>
  <v-container fluid>
    <v-expansion-panels accordion>
      <v-expansion-panel>
        <v-expansion-panel-header class="display-1">
          {{ $General.GetString('chartsettings') }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card flat>
            <v-row>
              <v-col cols="6">
                <v-text-field v-model="ChartSettings.URLParamenters.SinceDate" type="date" />
                <v-text-field v-model="ChartSettings.URLParamenters.SinceTime" type="time" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="ChartSettings.URLParamenters.UntilDate" type="date" />
                <v-text-field v-model="ChartSettings.URLParamenters.UntilTime" type="time" />
              </v-col>
              <v-col cols="12">
                <v-select prepend-inner-icon="mdi-key" v-model="ChartSettings.URLParamenters.PVString" :items="ChartSettings.ExperimentsList.Items" :rules="[(v) => !!v || $General.GetString('noempty')]"></v-select>
                <v-btn block color="info" @click="UpdateData()">
                  <v-icon>mdi-update</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-divider class="my-5" />
    <v-card class="pa-5" color="white">
      <div id="chart">
        <div v-if="Warning.Loading" class="text-center">
          <v-progress-circular :size="200" width="25" :color="Warning.Color" indeterminate></v-progress-circular>
          <h1 class="mt-6 info--text">{{ Warning.Message }}</h1>
        </div>
        <apexchart v-else width="100%" type="area" :options="options" :series="series"> </apexchart>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    Warning: {
      Loading: true,
      Message: '',
      Color: '',
    },
    ChartSettings: {
      UpdatedData: {},
      URLParamenters: {},
      ExperimentsList: {
        Items: [],
        Labels: [],
        Series: [],
      },
    },
    options: {},
    series: [],
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
      var NewSinceDate = this.$Moment(String(this.ChartSettings.URLParamenters.SinceDate)).format('YYYY-MM-DD') + ' ' + this.ChartSettings.URLParamenters.SinceTime + ':00';
      var NewUntilDate = this.$Moment(String(this.ChartSettings.URLParamenters.UntilDate)).format('YYYY-MM-DD') + ' ' + this.ChartSettings.URLParamenters.UntilTime + ':00';
      window.location.href = '/chart?pvstring=' + this.ChartSettings.URLParamenters.PVString + '&since=' + NewSinceDate + '&until=' + NewUntilDate;
    },
    LoadParamenters() {
      this.ChartSettings.URLParamenters = {
        PVString: this.$route.query.pvstring,
        ShortID: this.$route.query.pvstring.split(':')[0],
        Val1: this.$route.query.pvstring.split(':')[1],
        Val2: this.$route.query.pvstring.split(':')[2],
        Since: this.$route.query.since,
        Until: this.$route.query.until,
        SinceDate: this.$Moment(String(this.$route.query.since)).format('YYYY-MM-DD'),
        SinceTime: this.$Moment(String(this.$route.query.since)).format('HH:mm'),
        UntilDate: this.$Moment(String(this.$route.query.until)).format('YYYY-MM-DD'),
        UntilTime: this.$Moment(String(this.$route.query.until)).format('HH:mm'),
      };
    },
    GetData() {
      this.Warning.Loading = true;
      this.Warning.Message = this.$General.GetString('loading');
      this.Warning.Color = 'info';
      var Data = {
        since: this.ChartSettings.URLParamenters.Since,
        until: this.ChartSettings.URLParamenters.Until,
      };
      var AxiosConfig = { method: 'POST', url: this.$General.APIData() + this.$route.query.pvstring.split(':')[0], headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json;charset=UTF-8' }, data: Data };
      var Subtitle = this.ChartSettings.URLParamenters.Since == null ? this.$General.GetString('last7records') : this.$Moment(String(this.ChartSettings.URLParamenters.Since)).format('DD.MM.YYYY') + ' - ' + this.$Moment(String(this.ChartSettings.URLParamenters.Until)).format('DD.MM.YYYY');
      this.$Axios(AxiosConfig)
        .then((DataResult) => {
          DataResult.data.data.experiment.process_variable_urls.forEach((Element) => {
            this.ChartSettings.ExperimentsList.Items.push(Element.split('/')[3]);
          });
          DataResult.data.data.process_variables_data[this.ChartSettings.URLParamenters.PVString].forEach((Element) => {
            this.ChartSettings.ExperimentsList.Series.push(Element.data.toFixed(2));
            this.ChartSettings.ExperimentsList.Labels.push(this.$Moment(String(Element.time)).format('DD.MM.YYYY, HH:mm'));
          });
          this.options = {
            type: 'area',
            chart: {
              id: 'vuechart-example',
              zoom: {
                enabled: true,
                type: 'xy',
                autoScaleYaxis: false,
                zoomedArea: {
                  fill: {
                    color: 'blue',
                    opacity: 0.5,
                  },
                  stroke: {
                    color: 'black',
                    opacity: 0.5,
                    width: 2,
                  },
                },
              },
            },
            title: {
              text: this.ChartSettings.URLParamenters.PVString,
            },
            subtitle: {
              text: Subtitle,
            },
            xaxis: {
              categories: this.ChartSettings.ExperimentsList.Labels,
              labels: {
                rotate: -90,
              },
            },
          };
          this.series[0] = {
            name: 'Value ',
            data: this.ChartSettings.ExperimentsList.Series,
          };
          this.Warning.Loading = false;
          this.Warning.Message = '';
          this.Warning.Color = '';
        })
        .catch((Error) => {
          this.Warning.Loading = false;
          this.Warning.Message = Error.response.data.message;
          this.Warning.Color = 'error';
          console.log(Error);
        });
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
  },
  async mounted() {
    if (this.$route.query.pvstring != null) {
      await this.LoadParamenters();
      await this.GetData();
    } else {
      window.location.href = '/experiments-and-pvs';
    }
    // this.PostPPBData();
  },
};
</script>