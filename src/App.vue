<template>
  <v-app>
    <v-app-bar app color="info" dark>
      <v-btn small to="/" link fab>
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn small @click="GeneralSettings.Drawer = !GeneralSettings.Drawer" fab>
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="GeneralSettings.Drawer" color="info" absolute right temporary>
      <v-list nav dense>
        <v-list-item dark>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              Name
            </v-list-item-title>
            <v-list-item-subtitle class="mt-2">Email</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <transition name="slide-fade" mode="out-in">
        <router-view :key="$route.fullPath" />
      </transition>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  components: {

  },
  data: () => ({
    GeneralSettings: {
      Drawer: false,
      UserInfos: null,
    },
  }),
  methods: {

  },
  mounted() {

  },
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

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Fade-Slide Animation */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>