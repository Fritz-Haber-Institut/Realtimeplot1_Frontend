<template>
  <div>
    <router-link v-if="isLoggedUserAssigned" :to="`/chart?pvstring=${pvString}`">
      {{ pvString }}
    </router-link>
    <div v-else>
      {{ pvString }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pvString: {
      type: String,
      required: true
    },
    currentUserExpURLs: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      isLoggedUserAssigned: false,
    }
  },
  watch: {
    currentUserExpURLs() {
      // console.log('change');
      this.checkIfUserOwnsPV()
    }
  },
  methods: {
    checkIfUserOwnsPV() {
      const currentUserExperiments = this.currentUserExpURLs.map(url => url.split('experiments/')[1])
      this.isLoggedUserAssigned = currentUserExperiments.some(exp => exp === this.pvString.split(':')[0])
    }
  }
}
</script>