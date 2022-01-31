<template>
  <div>
    <router-link v-if="isLoggedUserAssigned" :to="`/chart?pvstring=${pvString}`">
      <span v-html="formattedPVString"></span>
    </router-link>
    <div v-else>
      <span v-html="formattedPVString"></span>
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
  computed: {
    formattedPVString() {
      return this.pvString.split('').map(s => {
        if (s === ':') return s.concat('<wbr>')
        else return s
      }).join('')
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