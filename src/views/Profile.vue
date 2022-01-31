<template>
  <v-container>
    <Userform :user="this.$props.user" type="PUT" target="/current" />
  </v-container>
</template>

<script>
import Userform from '../components/Userform';
export default {
  components: {
    Userform,
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
