<script setup lang="ts">
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'

type Side = 'top' | 'right' | 'bottom' | 'left'
type Align = 'start' | 'center' | 'end'

interface Props {
  side?: Side
  align?: Align
  sideOffset?: number
}

withDefaults(defineProps<Props>(), {
  side: 'bottom',
  align: 'end',
  sideOffset: 4,
})

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child data-slot="popover-trigger">
      <slot name="trigger" />
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        data-slot="popover-content"
        :data-side="side"
        class="z-50 flex min-w-40 flex-col gap-0.5 rounded-md bg-raised p-1 text-primary shadow-card focus-visible:outline-none"
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
