<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { formatInTimeZone } from 'date-fns-tz'
import type { Brand, Flyer, FlyerInput, SlideInput, Timezone } from '~/types'

interface Props {
  flyer: FlyerInput
  liveFlyers: Flyer[]
  timezone: Timezone
  brand?: Brand | null
  publishing?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  brand: null,
  publishing: false,
  error: null,
})

const emit = defineEmits<{
  publish: []
}>()

const open = defineModel<boolean>('open', { default: false })

const MAX_SECONDS_BETWEEN_SHOWINGS = 90

const slideList = ref<HTMLElement | null>(null)

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  const firstNew = slideList.value?.querySelector<HTMLElement>('[data-new]')
  firstNew?.scrollIntoView({ block: 'nearest', inline: 'center' })
})

interface Thumb {
  key: string
  slide: SlideInput
  isNew: boolean
}

function thumbsFor(flyers: Flyer[]): Thumb[] {
  return flyers.flatMap((flyer) => flyer.slides.map((slide) => ({ key: slide.id, slide, isNew: false })))
}

const today = computed(() => formatInTimeZone(new Date(), props.timezone, 'yyyy-MM-dd'))
const startsToday = computed(() => props.flyer.startDate <= today.value)

const rotation = computed(() => {
  const events = props.liveFlyers.filter((flyer) => flyer.type === 'one_time')
  const weekly = props.liveFlyers.filter((flyer) => flyer.type === 'weekly')
  const added = startsToday.value
    ? props.flyer.slides.map((slide, index) => ({ key: `new-${index}`, slide, isNew: true }))
    : []

  return props.flyer.type === 'one_time'
    ? [...thumbsFor(events), ...added, ...thumbsFor(weekly)]
    : [...thumbsFor(events), ...thumbsFor(weekly), ...added]
})

const loopSeconds = computed(() => totalSeconds(rotation.value.map((thumb) => thumb.slide)))
const newCount = computed(() => props.flyer.slides.length)

const description = computed(() => {
  const one = newCount.value === 1
  const slides = `Your ${newCount.value} new ${one ? 'slide' : 'slides'} ${one ? 'joins' : 'join'}`
  return startsToday.value
    ? `${slides} what’s already playing. Nothing gets removed.`
    : `${slides} the rotation on ${formatDayDate(props.flyer.startDate)}. Nothing gets removed.`
})

const notes = computed(() => [
  startsToday.value
    ? 'Starts playing within about 1 minute.'
    : `Starts playing on ${formatDayDate(props.flyer.startDate)}.`,
  props.flyer.type === 'one_time' && props.flyer.endDate
    ? `Plays while the gym is open and comes off after ${formatShortDate(props.flyer.endDate)}.`
    : 'Plays while the gym is open, until you remove it.',
  ...props.liveFlyers
    .filter((flyer) => flyer.type === 'one_time' && flyer.endDate)
    .map((flyer) => `${flyer.title} keeps playing and comes off after ${formatShortDate(flyer.endDate!)}.`),
])
</script>

<template>
  <UiDialog v-model:open="open" title="Add to the gym TV?" :description="description">
    <section data-slot="flyer-publish-rotation" class="flex w-full flex-col gap-2.5">
      <header class="flex items-center justify-between">
        <p class="label-micro text-secondary">New rotation</p>
        <p class="label-field text-primary">
          {{ rotation.length }} {{ rotation.length === 1 ? 'slide' : 'slides' }} · {{ loopSeconds }} s loop
        </p>
      </header>

      <ol ref="slideList" data-slot="flyer-publish-slides" class="flex w-full gap-2 overflow-x-auto pb-1">
        <li
          v-for="thumb in rotation"
          :key="thumb.key"
          data-slot="flyer-publish-slide"
          :data-new="thumb.isNew || undefined"
          class="flex w-[124px] shrink-0 flex-col gap-1"
        >
          <TvSlide
            :slide="thumb.slide"
            :brand="brand"
            :class="['rounded-sm', thumb.isNew ? 'ring-2 ring-action-primary ring-offset-2 ring-offset-raised' : '']"
          />
          <p v-if="thumb.isNew" class="label-micro text-primary">New</p>
          <p v-else class="caption text-secondary">Playing</p>
        </li>
      </ol>
    </section>

    <ul data-slot="flyer-publish-notes" class="flex w-full list-inside list-disc flex-col gap-2 rounded-md bg-surface p-4 body-sm text-primary">
      <li v-for="note in notes" :key="note">{{ note }}</li>
    </ul>

    <p
      v-if="loopSeconds > MAX_SECONDS_BETWEEN_SHOWINGS"
      data-slot="flyer-publish-warning"
      class="body-sm rounded-md bg-status-warning-bg px-4 py-3 text-status-warning-text"
    >
      That’s a lot of slides: each one would only show once every {{ loopSeconds }} s. Consider pausing an older flyer.
    </p>

    <p v-if="error" role="alert" class="body-sm rounded-md bg-status-error-bg px-4 py-3 text-status-error-text">
      {{ error }}
    </p>

    <template #actions>
      <UiButton variant="secondary" :disabled="publishing" @click="open = false">Go back</UiButton>
      <UiButton :loading="publishing" @click="emit('publish')">Add to TV</UiButton>
    </template>
  </UiDialog>
</template>
