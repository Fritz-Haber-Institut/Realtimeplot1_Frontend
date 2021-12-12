<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-btn to="/" link>
        <v-icon>mdi-home</v-icon>
        <span class="ml-2">Homepage</span>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn href="https://vuetifyjs.com/en" target="_blank" text>
        <v-icon>mdi-open-in-new</v-icon>
        <span class="ml-2">Vuetify V2.4 (MIT License)</span>
      </v-btn>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',

  data: () => ({}),
};
</script>
<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700');
@import url('https://fonts.googleapis.com/css?family=Tajawal:300,400,500,700');

* {
  font-family: 'Roboto', 'Tajawal' !important;
}
body {
  padding: 0 !important;
}
</style>