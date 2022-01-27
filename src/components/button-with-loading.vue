<template>
  <div :style="wrapperStyle" ref="btnWithLoading" class="d-flex justify-center">
    <v-progress-circular v-if="loading" indeterminate color="primary" />
    <v-btn v-else color="blue darken-1" text :disabled="disabled" @click.native="emitClicked">
      <slot></slot>
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      required: true,
      default: false
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      wrapperStyle: {
        width: 'inherit'
      }
    }
  },
  methods: {
    emitClicked() {
      this.$emit('clicked')
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.wrapperStyle.width = `${this.$refs.btnWithLoading.clientWidth}px`
    })
  }
}
</script>