<template>
  <v-container>
    <Userform type="PUT" target="/current" />
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
