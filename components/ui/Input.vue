<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { FieldControl, FieldDescription, FieldError, FieldLabel, FieldRoot } from 'reka-ui'

type Size = 'sm' | 'md' | 'lg'

interface Props {
  label?: string
  description?: string
  error?: string
  name?: string
  type?: string
  size?: Size
  icon?: Component
  trailingIcon?: Component
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  required: false,
})

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<string | number>()

const base = [
  'w-full rounded-md border border-subtle bg-surface text-primary',
  'placeholder:text-disabled',
  'transition-colors duration-150',
  'hover:border-strong',
  'focus-visible:outline-none focus-visible:border-action-primary focus-visible:ring-4 focus-visible:ring-focus',
  'data-[invalid]:border-status-error data-[invalid]:focus-visible:ring-status-error/25',
  'disabled:cursor-not-allowed disabled:border-subtle disabled:bg-action-disabled disabled:text-disabled',
].join(' ')

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 body-sm',
  md: 'h-10 px-3 body-md',
  lg: 'h-12 px-4 body-md',
}

const iconPadding: Record<Size, { left: string, right: string }> = {
  sm: { left: 'pl-8', right: 'pr-8' },
  md: { left: 'pl-10', right: 'pr-10' },
  lg: { left: 'pl-11', right: 'pr-11' },
}

const iconSizes: Record<Size, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-5',
}

const iconOffset: Record<Size, { left: string, right: string }> = {
  sm: { left: 'left-2.5', right: 'right-2.5' },
  md: { left: 'left-3', right: 'right-3' },
  lg: { left: 'left-4', right: 'right-4' },
}

const classes = computed(() => [
  base,
  sizes[props.size],
  props.icon ? iconPadding[props.size].left : '',
  props.trailingIcon ? iconPadding[props.size].right : '',
])

const iconClasses = 'pointer-events-none absolute top-1/2 -translate-y-1/2 text-secondary transition-colors group-data-[disabled]:text-disabled'
</script>

<template>
  <FieldRoot
    data-slot="input-field"
    :data-size="size"
    :name="name"
    :disabled="disabled"
    :required="required"
    :invalid="error ? true : undefined"
    class="group flex flex-col gap-1.5"
  >
    <FieldLabel
      v-if="label"
      data-slot="input-label"
      class="label-field text-primary group-data-[disabled]:text-disabled"
    >
      {{ label }}
      <span v-if="required" class="text-status-error" aria-hidden="true">*</span>
    </FieldLabel>

    <div data-slot="input-wrapper" class="relative">
      <component
        :is="icon"
        v-if="icon"
        data-slot="input-icon"
        :class="[iconClasses, iconSizes[size], iconOffset[size].left]"
        aria-hidden="true"
      />

      <FieldControl
        v-bind="$attrs"
        v-model="modelValue"
        data-slot="input"
        :type="type"
        :class="classes"
      />

      <component
        :is="trailingIcon"
        v-if="trailingIcon"
        data-slot="input-trailing-icon"
        :class="[iconClasses, iconSizes[size], iconOffset[size].right]"
        aria-hidden="true"
      />
    </div>

    <FieldDescription
      v-if="description && !error"
      data-slot="input-description"
      class="caption text-secondary"
    >
      {{ description }}
    </FieldDescription>

    <FieldError
      v-if="error"
      data-slot="input-error"
      :match="true"
      class="caption text-status-error-text"
    >
      {{ error }}
    </FieldError>
  </FieldRoot>
</template>
