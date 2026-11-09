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
    class="grid w-full grid-cols-[1fr_auto_1fr] items-center border-b border-subtle bg-raised px-8 py-4 max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-x-4 max-md:gap-y-3 max-sm:px-4 max-sm:py-3"
  >
    <div data-slot="flow-header-brand" class="flex items-center gap-2.5 max-md:min-w-0">
      <UiAvatar :name="organizationName" :src="logo ?? undefined" size="sm" class="!rounded-sm" />
      <p data-slot="flow-header-title" class="heading-h3 text-primary max-md:truncate">{{ title }}</p>
    </div>

    <UiStepper v-if="steps.length" v-model="step" :steps="steps" variant="inline" class="max-md:col-span-2 max-md:row-start-2 max-md:justify-self-center" />
    <span v-else aria-hidden="true" class="max-md:hidden" />

    <UiButton variant="secondary" class="justify-self-end" @click="emit('cancel')">Cancel</UiButton>
  </header>
</template>
