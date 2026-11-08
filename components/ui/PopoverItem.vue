<script setup lang="ts">
import type { Component } from 'vue'
import { PopoverClose } from 'reka-ui'

interface Props {
  icon?: Component
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})
</script>

<template>
  <PopoverClose
    as="button"
    type="button"
    :disabled="disabled"
    data-slot="popover-item"
    class="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left body-sm text-primary transition-colors duration-150 hover:bg-action-subtle-hover active:bg-action-subtle-pressed focus-visible:outline-none focus-visible:bg-action-subtle-hover disabled:cursor-not-allowed disabled:text-disabled disabled:hover:bg-transparent"
  >
    <component
      :is="icon"
      v-if="icon"
      data-slot="popover-item-icon"
      class="size-4 shrink-0 text-secondary"
      aria-hidden="true"
    />
    <slot />
  </PopoverClose>
</template>
