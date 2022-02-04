<template>
  <v-container fluid>
    <div v-if="ChartSettings.Loading" class="text-center">
      <v-card class="pa-5" color="white">
        <v-progress-circular :size="200" width="25" color="info" indeterminate></v-progress-circular>
        <h1 class="mt-6 info--text">{{ $General.GetString('loading') }}</h1>
      </v-card>
    </div>
    <div v-else>
      <v-divider />
      <v-expansion-panels accordion>
        <v-expansion-panel>
          <v-expansion-panel-header class="headline font-weight-bold">
            {{ $General.GetString('chartsettings').replace('{0}', ChartSettings.URLParamenters.PVString) }}
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
      <v-card class="pa-2" color="white">
        <v-row align="start" no-gutters>
          <v-col cols="3" class="text-start">
            <v-switch v-model="ChartSettings.Switcher" light false-value="ApexChart" true-value="ChartJS" :label="`${ChartSettings.Switcher}`"></v-switch>
          </v-col>
          <v-col cols="6" class="text-end">
            <v-alert outlined type="warning" rounded="pill">
              {{ $General.GetString('zoominst') }}
            </v-alert>
          </v-col>
          <v-col cols="3" class="text-end">
            <v-chip class="px-5" color="success" large>
              {{ $General.GetString('recordscount') + ' : ' + ChartSettings.ExperimentsList.XData.length }}
            </v-chip>
          </v-col>
        </v-row>
        <v-divider class="my-2" />
        <v-row>
          <v-col cols="4">
            <PVSetValue :user="user" />
          </v-col>
          <v-col cols="8">
            <EmailSubscription :pvString="$route.query.pvstring" />
          </v-col>
        </v-row>
        <v-divider class="my-2" />           
        <apexchart v-if="ChartSettings.Switcher == 'ApexChart'" width="100%" type="area" :options="options" :series="series"> </apexchart>
        <div v-else id="chart">
          <AreaChart
            :settings="{
              since: ChartSettings.URLParamenters.Since,
              until: ChartSettings.URLParamenters.Until,
              xdata: ChartSettings.ExperimentsList.XData,
              ydata: ChartSettings.ExperimentsList.YData,
              pv: ChartSettings.URLParamenters.PVString,
            }"
          />
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import AreaChart from './AreaChart.vue';
import EmailSubscription from './email-subscription.vue';
import PVSetValue from './PVSetValue.vue';
export default {
  components: {
    AreaChart,
    PVSetValue,
    EmailSubscription,
  },
  data: () => ({
    ChartSettings: {
      Switcher: 'ChartJS',
      Loading: true,
      UpdatedData: {},
      URLParamenters: {},
      ExperimentsList: {
        Series: [],
        Items: [],
        XData: [],
        YData: [],
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
      var IfDate = '';
      if (this.ChartSettings.URLParamenters.SinceDate != 'Invalid date') {
        var NewSinceDate = this.$Moment(String(this.ChartSettings.URLParamenters.SinceDate)).format('YYYY-MM-DD') + ' ' + this.ChartSettings.URLParamenters.SinceTime + ':00';
        var NewUntilDate = this.$Moment(String(this.ChartSettings.URLParamenters.UntilDate)).format('YYYY-MM-DD') + ' ' + this.ChartSettings.URLParamenters.UntilTime + ':00';
        IfDate = '&since=' + NewSinceDate + '&until=' + NewUntilDate;
      }
      window.location.href = '/chart?pvstring=' + this.ChartSettings.URLParamenters.PVString + IfDate;
    },
    LoadParameters() {
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
      var Data = {
        since: this.ChartSettings.URLParamenters.Since,
        until: this.ChartSettings.URLParamenters.Until,
      };
      var Subtitle = this.ChartSettings.URLParamenters.Since == null ? this.$General.GetString('last7records') : this.$Moment(String(this.ChartSettings.URLParamenters.Since)).format('DD.MM.YYYY') + ' - ' + this.$Moment(String(this.ChartSettings.URLParamenters.Until)).format('DD.MM.YYYY');
      var AxiosConfig = { method: 'POST', url: this.$General.APIData() + this.$route.query.pvstring.split(':')[0] + '/' + this.$route.query.pvstring, headers: { 'x-access-tokens': this.$General.GetLSSettings('Token'), 'Content-Type': 'application/json;charset=UTF-8' }, data: Data };
      this.$Axios(AxiosConfig)
        .then((DataResult) => {
          DataResult.data.data.experiment.process_variable_urls.forEach((Element) => {
            this.ChartSettings.ExperimentsList.Items.push(Element.split('/')[3]);
          });
          DataResult.data.data.process_variables_data[this.ChartSettings.URLParamenters.PVString].forEach((Element) => {
            this.ChartSettings.ExperimentsList.YData.push(Element.data.toFixed(2));
            this.ChartSettings.ExperimentsList.XData.push(Element.time);
            var newArray = {
              x: Element.time,
              y: Element.data.toFixed(2),
            };
            this.ChartSettings.ExperimentsList.Series.push(newArray);
          });
          this.options = {
            type: 'area',
            markers: {
              size: 0,
            },
            chart: {
              animations: {
                enabled: false,
              },
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
            yaxis: {
              show: true,
              tickAmount: 3,
            },
            xaxis: {
              type: 'datetime',
              tickAmount: 1,
              labels: {
                rotate: -90,
              },
            },
          };
          this.series[0] = {
            name: 'Value',
            data: this.ChartSettings.ExperimentsList.Series,
          };
          this.ChartSettings.Loading = false;
        })
        .catch((Error) => {
          this.ChartSettings.Loading = false;
          console.log(Error);
        });
    },
  },
  async mounted() {
    if (this.$route.query.pvstring != null) {
      await this.LoadParameters();
      await this.GetData();
    } else {
      this.$router.push('/experiments')
    }
  },
};
</script>