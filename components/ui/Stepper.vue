<script setup lang="ts">
import type { Component } from 'vue'
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

interface Props {
  steps: StepperStep[]
  linear?: boolean
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  linear: true,
  clickable: false,
})

const modelValue = defineModel<number>({ default: 1 })
</script>

<template>
  <StepperRoot
    v-model="modelValue"
    data-slot="stepper"
    :linear="linear"
    class="flex w-full"
  >
    <StepperItem
      v-for="(step, index) in steps"
      :key="step.title"
      data-slot="stepper-item"
      :data-step="index + 1"
      :step="index + 1"
      :disabled="step.disabled"
      class="group relative flex flex-1 flex-col items-center"
    >
      <component
        :is="clickable ? StepperTrigger : 'div'"
        data-slot="stepper-trigger"
        class="flex flex-col items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus disabled:cursor-not-allowed"
      >
        <!-- Icon -->
        <component
          :is="step.icon"
          v-if="step.icon"
          data-slot="stepper-icon"
          class="size-6 text-action-soft transition-colors
                 group-data-[state=active]:text-action-primary
                 group-data-[state=completed]:text-action-primary/50"
          aria-hidden="true"
        />

        <StepperTitle
          data-slot="stepper-title"
          class="body-md text-secondary transition-colors
                 group-data-[state=active]:font-semibold group-data-[state=active]:text-primary"
        >
          {{ step.title }}
        </StepperTitle>

        <StepperIndicator
          data-slot="stepper-indicator"
          class=" flex size-6 items-center justify-center rounded-full bg-sunken caption text-secondary transition-colors
                 group-data-[state=active]:bg-action-primary group-data-[state=active]:text-on-inverse
                 group-data-[state=completed]:bg-status-success group-data-[state=completed]:text-on-inverse"
        >
          <Check v-if="index + 1 < modelValue" class="size-3.5" :stroke-width="3" />
          <span v-else>{{ index + 1 }}</span>
        </StepperIndicator>
      </component>

      <StepperSeparator
        v-if="index < steps.length - 1"
        data-slot="stepper-separator"
        class="absolute bottom-2.5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-1 rounded-full bg-action-soft transition-colors
               group-data-[state=completed]:bg-status-success"
      />
    </StepperItem>
  </StepperRoot>
</template>
