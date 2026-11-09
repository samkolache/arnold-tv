<script setup lang="ts">
import { computed } from 'vue'
import { LoaderCircle } from 'lucide-vue-next'
import type { Brand, FlyerDraft, FlyerDraftChange, FlyerDraftIssue } from '~/types'

interface Props {
  draft: FlyerDraft
  brand?: Brand | null
  regenerating?: boolean
  regenerateError?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  brand: null,
  regenerating: false,
  regenerateError: null,
})

const emit = defineEmits<{ regenerate: [feedback: string] }>()

const regenerateOpen = defineModel<boolean>('regenerateOpen', { default: false })

const slideIndex = defineModel<number>('slideIndex', { default: 0 })

const slides = computed(() => props.draft.flyer.slides)
const slide = computed(() => slides.value[slideIndex.value] ?? slides.value[0])

function notesFor<Note extends FlyerDraftIssue | FlyerDraftChange>(notes: Note[], index: number | null) {
  return notes.filter((note) => note.slideIndex === index)
}

const slideIssues = computed(() => notesFor(props.draft.issues, slideIndex.value))
const slideChanges = computed(() => notesFor(props.draft.changes, slideIndex.value))
const flyerIssues = computed(() => notesFor(props.draft.issues, null))
const flyerChanges = computed(() => notesFor(props.draft.changes, null))
</script>

<template>
  <div data-slot="flyer-draft-preview" class="flex w-full flex-col gap-6">
    <header data-slot="flyer-draft-preview-header" class="space-y-1">
      <h1 class="heading-h1 text-primary">{{ draft.flyer.title }}</h1>
      <p class="body-md text-secondary">
        {{ describeFlyerType(draft.flyer) }} · starts {{ formatDayDate(draft.flyer.startDate) }}
        <span v-if="draft.flyer.endDate"> · ends {{ formatDayDate(draft.flyer.endDate) }}</span>
      </p>
      <p class="caption text-secondary">
        QR code:
        <a v-if="draft.qrUrl" :href="draft.qrUrl" target="_blank" rel="noopener" class="text-link underline max-lg:break-all">{{ draft.qrUrl }}</a>
        <span v-else>none found</span>
      </p>
    </header>

    <div data-slot="flyer-draft-preview-body" class="flex w-full items-start gap-8 max-lg:flex-col max-lg:gap-6">
      <section data-slot="flyer-draft-preview-slide" class="flex min-w-0 flex-1 flex-col gap-4">
        <div data-slot="flyer-draft-preview-stage" class="relative">
          <TvSlide v-if="slide" :slide="slide" :brand="brand" class="rounded-lg shadow-card" />
          <div
            v-if="regenerating"
            data-slot="flyer-draft-preview-regenerating"
            class="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-inverse/70 text-on-inverse"
          >
            <LoaderCircle class="size-8 animate-spin" aria-hidden="true" />
            <p class="label-field">Regenerating slides…</p>
          </div>
        </div>

        <nav
          data-slot="flyer-draft-preview-pager"
          aria-label="Slides"
          class="flex items-center justify-between max-sm:flex-wrap max-sm:gap-3"
        >
          <p class="label-field text-primary">Slide {{ slideIndex + 1 }} of {{ slides.length }}</p>
          <div class="flex items-center gap-4">
            <div v-if="slides.length > 1" class="flex items-center gap-2">
              <button
                v-for="(item, index) in slides"
                :key="index"
                type="button"
                data-slot="flyer-draft-preview-dot"
                :aria-label="`Show slide ${index + 1}: ${item.headline}`"
                :aria-current="index === slideIndex ? 'true' : undefined"
                :class="[
                  'h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus',
                  index === slideIndex ? 'w-6 bg-action-primary' : 'w-2 bg-action-soft hover:bg-action-primary/50',
                ]"
                @click="slideIndex = index"
              />
            </div>
            <FlyerRegenerate
              v-model:open="regenerateOpen"
              :loading="regenerating"
              :error="regenerateError"
              @submit="emit('regenerate', $event)"
            />
          </div>
        </nav>
      </section>

      <aside data-slot="flyer-draft-preview-notes" class="flex w-[300px] shrink-0 flex-col gap-4 max-lg:w-full">
        <div class="flex flex-col gap-2">
          <p class="label-micro text-secondary">This slide</p>
          <p v-if="!slideIssues.length && !slideChanges.length" class="body-sm text-secondary">Nothing flagged.</p>
          <ul v-else class="flex flex-col gap-2">
            <li v-for="(issue, i) in slideIssues" :key="`issue-${i}`" class="body-sm rounded-md bg-status-warning-bg p-3 text-status-warning-text">
              <span class="label-micro block">Hard to read · {{ issue.field }}</span>
              {{ issue.message }}
            </li>
            <li v-for="(change, i) in slideChanges" :key="`change-${i}`" class="body-sm rounded-md bg-highlight-ai-soft p-3 text-highlight-ai-text">
              <span class="label-micro block">AI changed</span>
              {{ change.message }}
            </li>
          </ul>
        </div>

        <div v-if="flyerIssues.length || flyerChanges.length" class="flex flex-col gap-2">
          <p class="label-micro text-secondary">Whole flyer</p>
          <ul class="flex flex-col gap-2">
            <li v-for="(issue, i) in flyerIssues" :key="`issue-${i}`" class="body-sm rounded-md bg-status-warning-bg p-3 text-status-warning-text">
              <span class="label-micro block">Hard to read · {{ issue.field }}</span>
              {{ issue.message }}
            </li>
            <li v-for="(change, i) in flyerChanges" :key="`change-${i}`" class="body-sm rounded-md bg-highlight-ai-soft p-3 text-highlight-ai-text">
              <span class="label-micro block">AI changed</span>
              {{ change.message }}
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>
