<template>
  <v-container fluid>
    <v-card class="pa-5">
      <div id="chart">
        <apexchart width="100%" type="bar" :options="options" :series="series"> </apexchart>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    ChartSettings: {
      TimeInterval: {
        since: '2021-12-10 10:00:00',
        until: '2021-12-10 17:00:00',
      },
    },
    options: {
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
    GetData() {
      var AxiosConfig = { method: 'POST', url: this.$General.APIData() + 'PPB', headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json;charset=UTF-8' }, data: this.ChartSettings.TimeInterval };
      this.$Axios(AxiosConfig)
        .then((DataResult) => {
          var Labels = [];
          var Series = [];
          DataResult.data.data.process_variables_data['PPB:VmeCrateAfm:Temp2'].forEach((Element) => {
            Series.push(Element.data.toFixed(2));
            Labels.push(this.$Moment(String(Element.time)).format('DD.MM.YYYY, HH:mm:ss'));
          });
          this.options = {
            title: {
              text: 'PPB:VmeCrateAfm:Temp2',
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
    this.GetData();
  },
};
</script>
