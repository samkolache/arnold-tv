<script setup lang="ts">
import { computed } from 'vue'
import { Primitive, type PrimitiveProps } from 'reka-ui'

type Variant = 'default' | 'emphasis'
type Padding = 'none' | 'sm' | 'md' | 'lg'

interface Props extends PrimitiveProps {
  variant?: Variant
  padding?: Padding
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  variant: 'default',
  padding: 'md',
})

const base = 'rounded-xl bg-surface text-primary'

const variants: Record<Variant, string> = {
  default: 'shadow-card',
  emphasis: 'border-2 border-strong shadow-card',
}

const paddings: Record<Padding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const classes = computed(() => [
  base,
  variants[props.variant],
  paddings[props.padding],
])
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    data-slot="card"
    :data-variant="variant"
    :data-padding="padding"
    :class="classes"
  >
    <slot />
  </Primitive>
</template>
