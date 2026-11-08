<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'reka-ui'
import type { Brand, FlyerInput, FlyerType, GymHours } from '~/types'

interface Props {
  flyer: FlyerInput
  suggestedType: FlyerType
  gymHours?: GymHours | null
  brand?: Brand | null
  logo?: string | null
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  gymHours: null,
  brand: null,
  logo: null,
  error: null,
})

const emit = defineEmits<{
  editSlides: []
}>()

const type = defineModel<FlyerType>('type', { required: true })
const endDate = defineModel<string | null>('endDate', { required: true })

const options = computed(() => [
  {
    value: 'weekly' as const,
    title: 'Weekly classes: keep showing until I remove it',
    description: 'Each class shows its next upcoming time.',
    reason: 'Suggested, because your flyer lists weekly days.',
  },
  {
    value: 'one_time' as const,
    title: 'One-time event: come off after a date',
    description: 'For things like holiday hours or a launch. Ends on its own, so the TV never shows old info.',
    reason: 'Suggested, because your flyer lists specific dates.',
  },
].map((option) => ({
  ...option,
  description: option.value === props.suggestedType ? `${option.description} ${option.reason}` : option.description,
})))

function formatHour(time: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  const hour = hours % 12 || 12
  const period = hours < 12 ? 'AM' : 'PM'
  return minutes ? `${hour}:${String(minutes).padStart(2, '0')} ${period}` : `${hour} ${period}`
}

const hoursSummary = computed(() => {
  const days = Object.values(props.gymHours ?? {})
  const open = days.filter((hours) => hours !== null)
  if (!open.length) return 'While the gym is open'

  const first = open[0]!
  const sameEveryDay = days.length === 7 && open.length === 7
    && open.every((hours) => hours.open === first.open && hours.close === first.close)

  return sameEveryDay
    ? `While the gym is open · ${formatHour(first.open)} – ${formatHour(first.close)} daily`
    : 'While the gym is open · hours vary by day'
})

const endDateModel = computed({
  get: () => endDate.value ?? '',
  set: (value: string | number | undefined) => {
    endDate.value = value ? String(value) : null
  },
})
</script>

<template>
  <div data-slot="flyer-schedule" class="flex w-full items-start gap-8">
    <section data-slot="flyer-schedule-decision" class="flex min-w-0 flex-1 flex-col items-start gap-5">
      <h1 class="heading-h1 text-primary">When should it play?</h1>
      <h2 class="heading-h2 text-primary">How long?</h2>

      <RadioGroupRoot v-model="type" data-slot="flyer-schedule-options" class="flex w-full flex-col gap-5">
        <RadioGroupItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          data-slot="flyer-schedule-option"
          class="group flex w-full items-start gap-3.5 rounded-md border border-subtle bg-raised p-[18px] text-left transition-colors
                 hover:border-strong
                 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus
                 data-[state=checked]:border-2 data-[state=checked]:border-action-primary data-[state=checked]:p-[17px]"
        >
          <span
            data-slot="flyer-schedule-radio"
            class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-strong transition-colors
                   group-data-[state=checked]:border-action-primary"
          >
            <RadioGroupIndicator class="size-2.5 rounded-full bg-action-primary" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col gap-1">
            <span class="heading-h3 text-primary">{{ option.title }}</span>
            <span class="body-sm text-secondary">{{ option.description }}</span>
          </span>
        </RadioGroupItem>
      </RadioGroupRoot>

      <div v-if="type === 'one_time'" data-slot="flyer-schedule-end-date" class="w-full max-w-xs">
        <UiInput
          v-model="endDateModel"
          type="date"
          label="Comes off after"
          :min="flyer.startDate"
          required
        />
      </div>

      <div
        data-slot="flyer-schedule-hours"
        class="flex w-full items-center gap-3 rounded-md border border-subtle bg-raised p-[18px]"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <p class="heading-h3 text-primary">Hours</p>
          <p class="body-sm text-secondary">{{ hoursSummary }}</p>
        </div>
        <UiButton variant="secondary" disabled title="Coming soon">Change</UiButton>
      </div>

      <p v-if="error" role="alert" class="body-sm w-full rounded-md bg-status-error-bg px-4 py-3 text-status-error-text">
        {{ error }}
      </p>
    </section>

    <aside
      data-slot="flyer-schedule-summary"
      class="flex w-[300px] shrink-0 flex-col items-start gap-2.5 rounded-md border border-subtle bg-raised p-4"
    >
      <p class="label-micro text-secondary">You’re adding</p>
      <TvSlide
        v-if="flyer.slides[0]"
        :slide="flyer.slides[0]"
        :brand="brand"
        :logo="logo"
        class="rounded-sm"
      />
      <p class="heading-h3 text-primary">
        {{ flyer.title }} · {{ flyer.slides.length }} {{ flyer.slides.length === 1 ? 'slide' : 'slides' }}
      </p>
      <button
        type="button"
        class="label-button text-link hover:text-action-primary-hover"
        @click="emit('editSlides')"
      >
        Edit slides
      </button>
    </aside>
  </div>
</template>
