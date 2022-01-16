<template>
  <v-container fluid>
    <PVsform :user="this.$props.user" />
  </v-container>
</template>

<script>
import PVsform from '../components/PVs/PVsform.vue';

export default {
  components: {
    PVsform,
  },
  watch: {
    user(Value) {
      if (Value) {
        this.user = Value;
      }
    },
  },
  props: {
    user: {
      type: Object,
      requred: true,
    },
  },
};
</script>