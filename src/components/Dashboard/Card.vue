<template>
  <v-card :class="`border border-color--${buttonColor}`">
    <v-card-actions>
      <v-icon class="rounded-circle pa-10 elevation-10 ma-n4" :class="buttonColor" size="40" dark>{{ icon }}</v-icon>
      <v-spacer />
      <div class="text-end">
        <div class="headline font-weight-bold">{{ title }}</div>
        <div class="headline">{{ count }}</div>
      </div>
    </v-card-actions>
    <v-divider class="mt-8" />
    <v-card-title>
      <v-btn block :color="buttonColor" :to="buttonLink" max-width="200px">{{ buttonText }}</v-btn>
    </v-card-title>
  </v-card>
</template>

<script>
export default {
  data: () => ({
  }),
  props: {
    count: {
      type: Number,
      requred: true,
    },
    title: {
      type: String,
      requred: true,
    },
    buttonText: {
      type: String,
      requred: true,
    },
    buttonLink: {
      type: String,
      requred: true,
    },
    buttonColor: {
      type: String,
      requred: true,
    },
    icon: {
      type: String,
      requred: true,
    }
  }
};
</script>
<style lang="scss" scoped>
  .border {
    border-width: 1px;
    border-style: solid;
  }
  .border-color--info {
    border-color: #1E88E5
  }
  .border-color--success {
    border-color: #43A047
  }
  .border-color--warning {
    border-color: #fb8c00
  }
</style>