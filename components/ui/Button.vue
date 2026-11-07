<script setup lang="ts">
import { computed } from 'vue'
import { Primitive, type PrimitiveProps } from 'reka-ui'

type Variant = 'primary' | 'secondary' | 'ghost' | 'link'
type Size = 'sm' | 'md' | 'lg'

interface Props extends PrimitiveProps {
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

const base = [
  'inline-flex items-center justify-center gap-2 label-button',
  'transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus',
  'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none',
].join(' ')

const variants: Record<Variant, string> = {
  primary: [
    'rounded-md bg-action-primary text-on-inverse',
    'hover:bg-action-primary-hover',
    'active:bg-action-primary-pressed',
    'disabled:bg-action-disabled disabled:text-disabled',
    'aria-disabled:bg-action-disabled aria-disabled:text-disabled',
  ].join(' '),

  secondary: [
    'rounded-md border-2 border-action-primary bg-transparent text-action-primary',
    'hover:bg-action-subtle-hover hover:border-action-primary-hover hover:text-action-primary-hover',
    'active:bg-action-subtle-pressed active:border-action-primary-pressed active:text-action-primary-pressed',
    'disabled:bg-transparent disabled:border-subtle disabled:text-disabled',
    'aria-disabled:bg-transparent aria-disabled:border-subtle aria-disabled:text-disabled',
  ].join(' '),

  ghost: [
    'rounded-md bg-transparent text-action-primary',
    'hover:bg-action-subtle-hover hover:text-action-primary-hover',
    'active:bg-action-subtle-pressed active:text-action-primary-pressed',
    'disabled:bg-transparent disabled:text-disabled',
    'aria-disabled:bg-transparent aria-disabled:text-disabled',
  ].join(' '),

  link: [
    'rounded-sm bg-transparent text-link underline-offset-4',
    'hover:underline hover:text-action-primary-hover',
    'active:text-action-primary-pressed',
    'disabled:text-disabled disabled:no-underline',
    'aria-disabled:text-disabled aria-disabled:no-underline',
  ].join(' '),
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-12 px-6',
}

const isDisabled = computed(() => props.disabled || props.loading)


const isNativeButton = computed(() => !props.asChild && props.as === 'button')

const classes = computed(() => [
  base,
  variants[props.variant],
  props.variant === 'link' ? '' : sizes[props.size],
])
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="classes"
    :type="isNativeButton ? 'button' : undefined"
    :disabled="isNativeButton ? isDisabled : undefined"
    :aria-disabled="!isNativeButton && isDisabled ? 'true' : undefined"
    :tabindex="!isNativeButton && isDisabled ? -1 : undefined"
    :aria-busy="loading || undefined"
  >
    <span
      v-if="loading"
      class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden="true"
    />
    <slot />
  </Primitive>
</template>
