<template>
  <v-app>
    <v-app-bar small v-if="GeneralSettings.UserInfos != null" app color="info" dark style="z-index: 12 !important">
      <v-btn small to="/dashboard" link fab>
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-chip v-if="isCurrentUserAdmin" class="elevation-2 px-10 mr-3 justify-center" color="success">
        {{ `Admin ${$General.GetString('userMode')}` }}
      </v-chip>
      <v-btn small @click="GeneralSettings.Drawer = !GeneralSettings.Drawer" fab>
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer width="300" v-if="GeneralSettings.UserInfos != null" v-model="GeneralSettings.Drawer" color="secondary" app right temporary style="z-index: 12 !important">
      <v-list nav dense>
        <v-list-item dark>
          <v-list-item-content>
            <v-list-item-title class="text-h6"> {{ GeneralSettings.UserInfos.login_name }} </v-list-item-title>
            <v-list-item-subtitle class="mt-2">{{ GeneralSettings.UserInfos.email || $General.GetString('noemail') }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list dense nav dark>
        <v-list-item v-for="item in GeneralSettings.Navigation" :key="item.title" link :to="item.url">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list dense nav dark v-if="GeneralSettings.UserInfos.user_type == 'Admin'">
        <v-list-item v-for="item in GeneralSettings.AdminNavigation" :key="item.title" link :to="item.url">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-slot:append>
        <v-switch class="mx-5" dark v-model="GeneralSettings.DarkMode" inset flat :label="$General.GetString('darkmode')" @change="ChangeTheme"></v-switch>
        <v-divider />
        <div class="pa-2">
          <v-btn color="warning" block @click="Logout()">
            <v-icon small class="mr-2">mdi-logout</v-icon>
            {{ $General.GetString('logout') }}
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <v-main>
      <transition name="fade" mode="out-in">
        <Header :title="$router.currentRoute.meta.title" :icon="$router.currentRoute.meta.icon" :key="$route.fullPath" />
      </transition>
      <v-container fluid>
        <v-tabs v-if="isRouteExpOrPv" class="px-4">
          <v-spacer></v-spacer>
          <v-tab to="/experiments">Experiments</v-tab>
          <v-tab to="/pvs">Process Variables</v-tab>
        </v-tabs>
      </v-container>
      <transition name="fade">
        <router-view
          v-if="isRouteExpOrPv"
          :key="$route.fullPath"
          :shouldOpenCreatePVDialog="shouldOpenCreatePVDialog"
          @switch-tab="switchToPVsTab"
          @create-dialog-open="shouldOpenCreatePVDialog = false"/>
      </transition>
      <transition name="slide-fade" mode="out-in">
        <router-view v-if="!isRouteExpOrPv" :user="GeneralSettings.UserInfos" :key="$route.fullPath" />
      </transition>
    </v-main>
  </v-app>
</template>

<script>
import Header from './components/Header.vue';
export default {
  components: {
    Header,
  },
  data: () => ({
    LocalStorage: {},
    GeneralSettings: {
      Drawer: false,
      UserInfos: null,
      DarkMode: null,
      Navigation: null,
    },
    shouldOpenCreatePVDialog: false,
    isCurrentUserAdmin: false
    // tab: null
  }),
  watch: {
    $route(to, from) {
      if (to != from) {
        this.GetInfos();
      }
    },
    'GeneralSettings.UserInfos'(Value) {
      if (Value) {
        this.GeneralSettings.UserInfos = Value;
      }
    },
  },
  computed: {
    isRouteExpOrPv() {
      return this.$route.path ==='/experiments' || this.$route.path === '/pvs'
    }
  },
  methods: {
    GetInfos() {
      this.$Axios
        .get(this.$General.APIUsers() + '/current', this.$General.GetHeaderValue(this.$General.GetLSSettings().Token, true))
        .then((LoginResult) => {
          this.$CurrentUser = LoginResult.data.user;
          this.GeneralSettings.UserInfos = LoginResult.data.user;
          this.isCurrentUserAdmin = LoginResult.data.user.user_type === 'Admin'
          if (LoginResult.data.preferred_language != this.$General.GetLSSettings().preferred_language) {
            this.LocalStorage.Token = this.$General.GetLSSettings().Token;
            this.LocalStorage.preferred_language = LoginResult.data.user.preferred_language;
            this.LocalStorage.dark_theme = this.$General.GetLSSettings().dark_theme;
            this.$General.SetLSSettings(this.LocalStorage);
          }
        })
        .catch((Error) => {
          console.log(Error);
          this.GeneralSettings.UserInfos = null;
        });
    },
    Logout() {
      this.LocalStorage = this.$General.GetLSSettings();
      this.LocalStorage.Token = null;
      this.$General.SetLSSettings(this.LocalStorage);
      this.$General.ReloadPage('/login');
    },
    ChangeTheme () {
      this.LocalStorage.dark_theme = this.GeneralSettings.DarkMode;
      this.$General.SetLSSettings(this.LocalStorage);
      this.$vuetify.theme.dark = this.GeneralSettings.DarkMode;
    },
    // Tab methods
    switchToPVsTab() {
      this.shouldOpenCreatePVDialog = true;
      this.$router.push('/pvs')
    }
  },
  mounted() {
    if (this.$route.path != '/login') {
      this.GeneralSettings.DarkMode = this.$General.GetLSSettings().dark_theme;
      this.GeneralSettings.Navigation = [
        { title: this.$General.GetString('dashboard'), icon: 'mdi-home', url: '/dashboard' },        
        { title: this.$General.GetString('profile'), icon: 'mdi-account', url: '/profile' },
        { title: this.$General.GetString('manageExpAndPVs'), icon: 'mdi-camera-document', url: '/experiments' },
      ];
      this.GeneralSettings.AdminNavigation = [
        { title: this.$General.GetString('manageusers'), icon: 'mdi-account-multiple-outline', url: '/users' }
      ];
    }
    this.GetInfos();
    setInterval(() => {
      this.GetInfos();
    }, 300000);
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

.Full100 {
  width: 100%;
}
.Full50 {
  width: 50%;
}
</style>