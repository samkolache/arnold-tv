<script setup lang="ts">
import type { StepperStep } from '~/components/ui/Stepper.vue'

interface Props {
  title: string
  steps?: StepperStep[]
  organizationName?: string
  logo?: string | null
}

withDefaults(defineProps<Props>(), {
  steps: () => [],
  organizationName: '',
  logo: null,
})

const emit = defineEmits<{
  cancel: []
}>()

const step = defineModel<number>({ default: 1 })
</script>

<template>
  <header
    data-slot="flow-header"
    class="grid w-full grid-cols-[1fr_auto_1fr] items-center border-b border-subtle bg-raised px-8 py-4"
  >
    <div data-slot="flow-header-brand" class="flex items-center gap-2.5">
      <UiAvatar :name="organizationName" :src="logo ?? undefined" size="sm" class="!rounded-sm" />
      <p data-slot="flow-header-title" class="heading-h3 text-primary">{{ title }}</p>
    </div>

    <UiStepper v-if="steps.length" v-model="step" :steps="steps" variant="inline" />
    <span v-else aria-hidden="true" />

    <UiButton variant="secondary" class="justify-self-end" @click="emit('cancel')">Cancel</UiButton>
  </header>
</template>
