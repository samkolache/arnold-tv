<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import {
  StepperIndicator,
  StepperItem,
  StepperRoot,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from 'reka-ui'

export interface StepperStep {
  title: string
  icon?: Component
  disabled?: boolean
}

type Variant = 'stacked' | 'inline'

interface Props {
  steps: StepperStep[]
  linear?: boolean
  clickable?: boolean
  variant?: Variant
}

const props = withDefaults(defineProps<Props>(), {
  linear: true,
  clickable: false,
  variant: 'stacked',
})

const modelValue = defineModel<number>({ default: 1 })

const variants: Record<Variant, Record<'root' | 'item' | 'trigger' | 'title' | 'indicator' | 'separator', string>> = {
  stacked: {
    root: 'flex w-full',
    item: 'group relative flex flex-1 flex-col items-center',
    trigger: 'flex flex-col items-center gap-3',
    title: 'body-md group-data-[state=active]:font-semibold',
    indicator: 'size-6 bg-sunken caption',
    separator: 'absolute bottom-2.5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-1 rounded-full bg-action-soft',
  },
  inline: {
    root: 'flex items-center',
    item: 'group flex items-center gap-3',
    trigger: 'flex flex-row-reverse items-center gap-2',
    title: 'label-field max-sm:sr-only',
    indicator: 'size-7 border-[1.5px] border-subtle label-button group-data-[state=active]:border-action-primary group-data-[state=completed]:border-status-success',
    separator: 'h-[1.5px] w-10 bg-action-soft max-sm:w-6',
  },
}

const styles = computed(() => variants[props.variant])
</script>

<template>
  <StepperRoot
    v-model="modelValue"
    data-slot="stepper"
    :data-variant="variant"
    :linear="linear"
    :class="styles.root"
  >
    <StepperItem
      v-for="(step, index) in steps"
      :key="step.title"
      data-slot="stepper-item"
      :data-step="index + 1"
      :step="index + 1"
      :disabled="step.disabled"
      :class="[styles.item, variant === 'inline' && index > 0 ? 'ml-3' : '']"
    >
      <component
        :is="clickable ? StepperTrigger : 'div'"
        data-slot="stepper-trigger"
        :class="[
          styles.trigger,
          'rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus disabled:cursor-not-allowed',
        ]"
      >
        <component
          :is="step.icon"
          v-if="step.icon && variant === 'stacked'"
          data-slot="stepper-icon"
          class="size-6 text-action-soft transition-colors
                 group-data-[state=active]:text-action-primary
                 group-data-[state=completed]:text-action-primary/50"
          aria-hidden="true"
        />

        <StepperTitle
          data-slot="stepper-title"
          :class="[styles.title, 'text-secondary transition-colors group-data-[state=active]:text-primary']"
        >
          {{ step.title }}
        </StepperTitle>

        <StepperIndicator
          data-slot="stepper-indicator"
          :class="[
            styles.indicator,
            'flex items-center justify-center rounded-full text-secondary transition-colors',
            'group-data-[state=active]:bg-action-primary group-data-[state=active]:text-on-inverse',
            'group-data-[state=completed]:bg-status-success group-data-[state=completed]:text-on-inverse',
          ]"
        >
          <Check v-if="index + 1 < modelValue" class="size-3.5" :stroke-width="3" />
          <span v-else>{{ index + 1 }}</span>
        </StepperIndicator>
      </component>

      <StepperSeparator
        v-if="index < steps.length - 1"
        data-slot="stepper-separator"
        :class="[styles.separator, 'transition-colors group-data-[state=completed]:bg-status-success']"
      />
    </StepperItem>
  </StepperRoot>
</template>
