<template>
  <v-container fluid>
    <v-card flat>
      <v-card-actions class="secondary--text">
        <v-icon large class="secondary--text mr-2">{{ icon }}</v-icon>
        <h2>{{ title }}</h2>
      </v-card-actions>
      <v-divider />
    </v-card>
  </v-container>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
      default: '',
    },
    icon: {
      type: String,
      required: true,
      default: '',      
    },
  },
  methods: {},
  mounted() {},
};
</script>
