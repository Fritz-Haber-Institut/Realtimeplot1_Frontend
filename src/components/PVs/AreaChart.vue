<template>
  <div>
    <v-row align="center" no-gutters>
      <v-col cols="12" class="text-end">
        <a href="#" class="NoLink" id="downloader" @click="SaveImage()" download="image.png">
          <v-btn large color="info" rounded><v-icon class="mr-2">mdi-download</v-icon>{{ $General.GetString('saveasimage') }}</v-btn>
        </a>
        <v-btn large class="ml-2" color="secondary" @click="ResetZoom()" rounded><v-icon class="mr-2">mdi-home-search-outline</v-icon>{{ $General.GetString('resetzoom') }}</v-btn>
      </v-col>
    </v-row>
    <v-divider class="my-3" />
    <canvas id="Chart"></canvas>
  </div>
</template>

<script>
import { Chart } from 'chart.js';
import 'chartjs-plugin-zoom';

export default {
  props: {
    settings: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
  methods: {
    SaveImage() {
      document.getElementById('downloader').download = this.$props.settings.pv + '.png';
      document.getElementById('downloader').href = document
        .getElementById('Chart')
        .toDataURL('image/png')
        .replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    },
    CreateChart() {
      const ctx = document.getElementById('Chart');
      var Data = {
        type: 'line',
        data: {
          labels: this.$props.settings.xdata,
          datasets: [
            {
              data: this.$props.settings.ydata,
              borderColor: 'grey',
              borderWidth: 5,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: this.$props.settings.pv,
            fontSize: 25,
            fontColor: 'grey',
          },

          responsive: true,
          lineTension: 1,
          legend: {
            display: false,
          },
          scales: {
            xAxes: [
              {
                type: 'time',
                time: {
                  displayFormats: {
                    day: 'MMM YYYY',
                  },
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  padding: 15,
                },
              },
            ],
          },
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
                threshold: 5,
                modifierKey: 'ctrl',
              },
              zoom: {
                mode: 'xy',
                enabled: true,
              },
            },
          },
        },
      };
      new Chart(ctx, Data);
    },
    ResetZoom() {
      this.CreateChart();
    },
  },
  mounted() {
    this.CreateChart();
  },
};
</script>
<style scoped>
.NoLink {
  text-decoration: none;
}
</style>