<template>
  <v-container>
    <Userform type="PUT" target="/current" @do-logout="$emit('do-logout')" />
  </v-container>
</template>

<script>
import Userform from '../components/Userform';
export default {
  components: {
    Userform,
  }
};
</script>
