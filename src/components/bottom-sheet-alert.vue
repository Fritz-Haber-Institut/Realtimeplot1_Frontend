<template>
  <v-bottom-sheet v-model="isSheetOpen" width="30%" content-class="elevation-0">
    <v-sheet class="text-center rounded">
      <v-alert full-width height="100%" :type="type">
        <slot></slot>
      </v-alert>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script>
export default {
  props: {
    open: {
      type: Boolean,
      required: true
    },
    type: {
      type: String,
      required: true
    },
  },
  computed: {
    isSheetOpen: {
      get() {
        return this.open
      },
      set() {
        this.$emit('close-sheet')
      }
    }
  }
}
</script>