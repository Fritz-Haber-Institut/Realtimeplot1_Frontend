<template>
  <v-container fluid>
    <Statistics :user="this.$props.user" />
  </v-container>
</template>

<script>
import Statistics from '../components/Dashboard/Statistics.vue';

export default {
  components: {
    Statistics,
  },
  data() {
    return {};
  },
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
  methods: {},
  mounted() {},
};
</script>
