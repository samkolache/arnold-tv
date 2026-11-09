<script setup lang="ts">
import { computed } from 'vue'
import { LoaderCircle } from 'lucide-vue-next'
import { SlideKindSchema, type FlyerReadStage, type SlideKind, type SlideKindCounts } from '~/types'

type RowStatus = 'done' | 'working' | 'next'

interface Props {
  fileName: string
  imageUrl?: string | null
  description?: string | null
  stage: FlyerReadStage | 'done'
  found?: SlideKindCounts | null
  retrying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: null,
  description: null,
  found: null,
  retrying: false,
})

const emit = defineEmits<{
  cancel: []
}>()

const ORDER: (FlyerReadStage | 'done')[] = ['read', 'slides', 'check', 'done']

const STATUS_LABELS: Record<RowStatus, string> = {
  done: 'Done',
  working: 'Working',
  next: 'Next',
}

const chipClasses: Record<RowStatus, string> = {
  done: 'bg-sunken text-primary',
  working: 'bg-action-primary text-on-inverse',
  next: 'border border-subtle bg-raised text-secondary',
}

const textClasses: Record<RowStatus, string> = {
  done: 'body-md text-primary',
  working: 'label-field text-primary',
  next: 'body-md text-secondary',
}

const KIND_NOUNS: Record<SlideKind, [string, string]> = {
  class: ['class', 'classes'],
  event: ['event', 'events'],
  hours: ['hours update', 'hours updates'],
  closure: ['closure', 'closures'],
  new: ['new addition', 'new additions'],
  announcement: ['announcement', 'announcements'],
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

function joinList(items: string[]) {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : (items[0] ?? '')
}

const slideCount = computed(() => Object.values(props.found ?? {}).reduce((total, count) => total + count, 0))

const kindSummary = computed(() =>
  joinList(
    SlideKindSchema.options.flatMap((kind) => {
      const count = props.found?.[kind]
      return count ? [plural(count, ...KIND_NOUNS[kind])] : []
    }),
  ),
)

function statusOf(stage: FlyerReadStage): RowStatus {
  const row = ORDER.indexOf(stage)
  const current = ORDER.indexOf(props.stage)
  if (row < current) return 'done'
  return row === current ? 'working' : 'next'
}

const rows = computed(() => {
  const slides = plural(slideCount.value, 'slide', 'slides')

  return [
    {
      stage: 'read' as const,
      text: {
        next: props.description ? 'Reading your description' : 'Reading the text on your flyer',
        working: props.description ? 'Reading your description' : 'Reading the text on your flyer',
        done: props.description ? 'Read your description' : 'Read the text on your flyer',
      },
    },
    {
      stage: 'slides' as const,
      text: {
        next: 'Making slides',
        working: slideCount.value ? `Making ${slides}: ${kindSummary.value}` : 'Making slides',
        done: `Made ${slides}: ${kindSummary.value}`,
      },
    },
    {
      stage: 'check' as const,
      text: {
        next: 'Checking text is big enough to read from across the gym',
        working: props.retrying
          ? 'Shortening text so it reads from across the gym'
          : 'Checking text is big enough to read from across the gym',
        done: 'Text is big enough to read from across the gym',
      },
    },
  ].map((row) => {
    const status = statusOf(row.stage)
    return { stage: row.stage, status, text: row.text[status] }
  })
})
</script>

<template>
  <section
    data-slot="upload-reading-card"
    aria-live="polite"
    class="flex w-full items-start gap-8 rounded-lg border border-subtle bg-raised p-8 max-md:flex-col max-md:gap-6 max-sm:p-5"
  >
    <div
      data-slot="upload-reading-card-photo"
      class="flex h-[300px] w-60 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm bg-sunken text-center max-md:h-[220px] max-md:w-full"
    >
      <p
        v-if="description"
        data-slot="upload-reading-card-description"
        class="body-sm size-full overflow-y-auto whitespace-pre-line p-4 text-left text-primary"
      >
        {{ description }}
      </p>
      <img
        v-else-if="imageUrl"
        :src="imageUrl"
        :alt="`Uploaded photo: ${fileName}`"
        class="size-full object-contain"
      >
      <template v-else>
        <p class="caption text-secondary">Uploaded photo</p>
        <p class="caption text-secondary">{{ fileName }}</p>
      </template>
    </div>

    <div data-slot="upload-reading-card-progress" class="flex min-w-0 flex-1 flex-col items-start gap-4">
      <h1 data-slot="upload-reading-card-title" class="heading-h1 text-primary">{{ description ? 'Making your slides' : 'Reading your flyer' }}</h1>
      <p data-slot="upload-reading-card-subtitle" class="body-sm text-secondary">Usually under 30 seconds</p>

      <ol data-slot="upload-reading-card-steps" class="flex w-full flex-col gap-4">
        <li
          v-for="row in rows"
          :key="row.stage"
          data-slot="upload-reading-card-step"
          :data-status="row.status"
          class="flex w-full items-center gap-3"
        >
          <span
            data-slot="upload-reading-card-chip"
            :class="['label-button flex w-24 shrink-0 items-center justify-center rounded-full px-3 py-1.5', chipClasses[row.status]]"
          >
            {{ STATUS_LABELS[row.status] }}
          </span>
          <p data-slot="upload-reading-card-step-text" :class="textClasses[row.status]">{{ row.text }}</p>
          <LoaderCircle
            v-if="row.status === 'working'"
            data-slot="upload-reading-card-spinner"
            class="size-4 shrink-0 animate-spin text-secondary"
            aria-hidden="true"
          />
        </li>
      </ol>

      <UiButton variant="secondary" @click="emit('cancel')">Cancel</UiButton>
    </div>
  </section>
</template>
