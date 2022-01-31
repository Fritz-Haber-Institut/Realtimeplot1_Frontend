<template>
  <v-container fluid>
    <Users :user="this.$props.user" />
  </v-container>
</template>

<script>
import Users from '../components/Users.vue';

export default {
  components: {
    Users,
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
