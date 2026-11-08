<script setup lang="ts">
import { computed, useId } from 'vue'
import { ProgressIndicator, ProgressRoot } from 'reka-ui'

type Variant = 'primary' | 'success' | 'warning' | 'error' | 'pop'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  max?: number
  variant?: Variant
  size?: Size
  label?: string
  showValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  variant: 'primary',
  size: 'md',
  showValue: false,
})

const modelValue = defineModel<number | null>({ default: 0 })

const labelId = useId()

const variants: Record<Variant, string> = {
  primary: 'bg-action-primary',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  error: 'bg-status-error',
  pop: 'bg-highlight-pop',
}

const sizes: Record<Size, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const isIndeterminate = computed(() => modelValue.value === null || modelValue.value === undefined)

const percentage = computed(() => {
  if (isIndeterminate.value) return 0
  return Math.min(100, Math.max(0, (modelValue.value! / props.max) * 100))
})

const indicatorStyle = computed(() =>
  isIndeterminate.value ? undefined : { transform: `translateX(-${100 - percentage.value}%)` },
)
</script>

<template>
  <div data-slot="progress-field" :data-size="size" class="flex w-full flex-col gap-1.5">
    <div
      v-if="label || showValue"
      data-slot="progress-header"
      class="flex items-center justify-between gap-2"
    >
      <span
        v-if="label"
        :id="labelId"
        data-slot="progress-label"
        class="label-field text-primary"
      >
        {{ label }}
      </span>
      <span
        v-if="showValue && !isIndeterminate"
        data-slot="progress-value"
        class="caption ml-auto text-secondary tabular-nums"
      >
        {{ Math.round(percentage) }}%
      </span>
    </div>

    <ProgressRoot
      v-model="modelValue"
      data-slot="progress"
      :data-variant="variant"
      :max="max"
      :aria-labelledby="label ? labelId : undefined"
      :class="['relative w-full overflow-hidden rounded-full bg-sunken', sizes[size]]"
    >
      <ProgressIndicator
        data-slot="progress-indicator"
        :class="[
          'size-full rounded-full transition-transform duration-300 ease-out',
          'data-[state=indeterminate]:animate-pulse',
          variants[variant],
        ]"
        :style="indicatorStyle"
      />
    </ProgressRoot>
  </div>
</template>
