<template>
  <div :style="wrapperStyle" ref="btnWithLoadingWrapper" class="d-flex justify-center">
    <v-progress-circular v-if="loading" indeterminate color="primary" />
    <v-btn v-else :color="color" :text="!hasBg" :disabled="disabled" @click.native="emitClicked">
      <v-icon v-if="icon" left>{{ icon }}</v-icon>
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
    },
    color: {
      type: String,
      default: 'blue darken-1'
    },
    icon: {
      type: String
    },
    hasBg: {
      type: Boolean,
      default: false
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
      this.wrapperStyle.width = `${this.$refs.btnWithLoadingWrapper.clientWidth}px`
    })
  }
}
</script>