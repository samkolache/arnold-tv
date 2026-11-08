<script setup lang="ts">
import type { Component } from 'vue'
import { PopoverClose } from 'reka-ui'

type Tone = 'default' | 'danger'

interface Props {
  icon?: Component
  disabled?: boolean
  tone?: Tone
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  tone: 'default',
})

const tones: Record<Tone, { item: string, icon: string }> = {
  default: { item: 'text-primary', icon: 'text-secondary' },
  danger: { item: 'text-status-error-text', icon: 'text-status-error-text' },
}
</script>

<template>
  <PopoverClose
    as="button"
    type="button"
    :disabled="disabled"
    data-slot="popover-item"
    :data-tone="tone"
    :class="tones[tone].item"
    class="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left body-sm transition-colors duration-150 hover:bg-action-subtle-hover active:bg-action-subtle-pressed focus-visible:outline-none focus-visible:bg-action-subtle-hover disabled:cursor-not-allowed disabled:text-disabled disabled:hover:bg-transparent"
  >
    <component
      :is="icon"
      v-if="icon"
      data-slot="popover-item-icon"
      :class="tones[tone].icon"
      class="size-4 shrink-0"
      aria-hidden="true"
    />
    <slot />
  </PopoverClose>
</template>
