<template>
  <v-card>
    <v-card-actions>
      <v-icon class="rounded-circle pa-10 elevation-10 ma-n4" v-bind:class="$props.settings.Color" size="40" dark>{{ $props.settings.Icon }}</v-icon>
      <v-spacer />
      <div class="text-end">
        <div class="headline font-weight-bold">{{ $props.settings.Title }}</div>
        <div class="headline">{{ $props.settings.Count }}</div>
      </div>
    </v-card-actions>
    <v-divider class="mt-8" />
    <v-card-title>
      <v-btn block :color="$props.settings.Color" :to="$props.settings.Link">{{ $props.settings.Button }}</v-btn>
    </v-card-title>
  </v-card>
</template>

<script>
export default {
  data: () => ({
  }),
  watch: {
    settings(Value) {
      this.settings = Value;
    },
    user(Value) {
      this.user = Value;
    },
  },
  props: {
    settings: {
      type: Object,
      requred: true,
    },
    user: {
      type: Object,
      requred: true,
    },
  },
  methods: {},
  mounted() {},
};
</script>
