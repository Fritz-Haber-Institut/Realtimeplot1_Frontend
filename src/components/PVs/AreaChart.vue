<script>
import { Line } from 'vue-chartjs';

export default {
  extends: Line,
  props: {
    xdata: {
      type: Array,
      required: true,
    },
    ydata: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  mounted() {
    this.renderChart(
      {
        labels: this.$props.xdata,
        datasets: [
          {
            label: 'Value',
            data: this.$props.ydata,
            backgroundColor: 'transparent',
            borderColor: 'rgba(1, 116, 188, 0.50)',
            pointBackgroundColor: 'rgba(171, 71, 188, 1)',
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: true,
              },
              ticks: {
                fontColor: '#8a909d',
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
              },
              ticks: {
                fontColor: '#8a909d',
              },              
            },
          ],
        },
        title: {
          display: true,
          text: this.$props.title,
          fontSize: 25,
          fontColor: 'grey',
        },
      }
    );
  },
};
</script>