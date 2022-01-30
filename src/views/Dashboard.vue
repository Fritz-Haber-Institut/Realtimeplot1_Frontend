<template>
  <v-container fluid>
    <Statistics :user="this.$props.user" />
    <Import-File :user="this.$props.user" style="width:60%" />    
  </v-container>
</template>

<script>
import Statistics from '../components/Dashboard/Statistics.vue';
import ImportFile from '../components/Dashboard/Import-File.vue';

export default {
  components: {
    Statistics,
    ImportFile,
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
