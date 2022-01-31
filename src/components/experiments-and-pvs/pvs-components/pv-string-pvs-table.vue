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
    currentUserExperiments: {
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
    currentUserExperiments() {
      this.checkIfUserOwnsPV()
    }
  },
  methods: {
    checkIfUserOwnsPV() {
      this.isLoggedUserAssigned = this.currentUserExperiments.some(exp => exp === this.pvString.split(':')[0])
    }
  },
  mounted() {
    this.checkIfUserOwnsPV()
  }
}
</script>