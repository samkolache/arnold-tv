<script setup lang="ts">
import { FlyerInputSchema, type FlyerDraft, type FlyerInput, type FlyerReadEvent, type FlyerReadStage, type FlyerType, type SlideKindCounts } from '~/types'

definePageMeta({ layout: false })

const steps = [
  { title: 'Upload' },
  { title: 'Review' },
  { title: 'Schedule' },
]

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024
const HINTS = ['JPG, PNG or WebP', 'Up to 10 MB', 'A phone photo works']
const MIN_DESCRIPTION = 10
const MAX_DESCRIPTION = 2000
const DESCRIPTION_PLACEHOLDER = `Write what should go on the TV: what it is, which days, what time, and any dates or links.

For example:
Free yoga with Sebastien, Saturdays 2 PM. Bring your own mat.
Boxing Tue and Thu 9:30 AM. Sign up at thearnold.com/boxing
Pool closed Mon, Nov 30 for resurfacing.

Each class, event or announcement becomes its own slide, so this makes 3 slides.`

const [{ data: organization }, { data: flyers }] = await Promise.all([useOrganization(), useFlyers()])
const { readFlyer, generateFlyer, regenerateFlyer } = useFlyerReader()
const { create } = useFlyerActions()

const step = ref(1)
const file = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const draft = ref<FlyerDraft | null>(null)
const error = ref<string | null>(null)
const reading = ref(false)
const description = ref<string | null>(null)
const generateOpen = ref(false)
const generateText = ref('')
const progress = reactive({
  stage: 'read' as FlyerReadStage | 'done',
  found: null as SlideKindCounts | null,
  retrying: false,
})

const schedule = reactive({ type: 'weekly' as FlyerType, endDate: null as string | null })
const slideIndex = ref(0)
const regenerateOpen = ref(false)
const regenerating = ref(false)
const regenerateError = ref<string | null>(null)
const scheduleError = ref<string | null>(null)
const confirmOpen = ref(false)
const publishing = ref(false)
const publishError = ref<string | null>(null)

const timezone = computed(() => organization.value?.timezone ?? 'UTC')

const scheduledFlyer = computed<FlyerInput | null>(() => {
  if (!draft.value) return null
  return {
    ...draft.value.flyer,
    type: schedule.type,
    endDate: schedule.type === 'one_time' ? schedule.endDate : null,
  }
})

const liveFlyers = computed(() =>
  flyers.value.filter((flyer) => flyer.slides.length > 0 && getFlyerStatus(flyer, timezone.value) === 'live'),
)

let abort: AbortController | null = null

function clearFile() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  file.value = null
}

function onReadEvent(event: FlyerReadEvent) {
  if (event.type === 'stage') progress.stage = event.stage
  if (event.type === 'found') progress.found = event.kinds
  if (event.type === 'retry') progress.retrying = true
}

async function runReader(read: (signal: AbortSignal) => Promise<FlyerDraft>) {
  error.value = null
  Object.assign(progress, { stage: 'read', found: null, retrying: false })
  reading.value = true

  const controller = new AbortController()
  abort = controller

  try {
    const result = await read(controller.signal)
    progress.stage = 'done'
    await new Promise((resolve) => setTimeout(resolve, 600))
    if (controller.signal.aborted) return

    draft.value = result
    slideIndex.value = 0
    step.value = 2
  } catch (caught) {
    if (controller.signal.aborted) return
    error.value = caught instanceof Error ? caught.message : "Couldn't read this flyer"
    clearFile()
  } finally {
    if (abort === controller) reading.value = false
  }
}

function startReading(selected: File) {
  clearFile()
  description.value = null
  file.value = selected
  previewUrl.value = URL.createObjectURL(selected)
  return runReader((signal) => readFlyer(selected, onReadEvent, signal))
}

function startGenerating() {
  const text = generateText.value.trim()
  if (text.length < MIN_DESCRIPTION) return

  clearFile()
  description.value = text
  generateOpen.value = false
  return runReader((signal) => generateFlyer(text, onReadEvent, signal))
}

function cancelReading() {
  abort?.abort()
  reading.value = false
  clearFile()
}

const isLastSlide = computed(() => !draft.value || slideIndex.value >= draft.value.flyer.slides.length - 1)

function reviewBack() {
  if (slideIndex.value > 0) slideIndex.value--
  else startOver()
}

function reviewNext() {
  if (isLastSlide.value) goToSchedule()
  else slideIndex.value++
}

async function regenerate(feedback: string) {
  if (!draft.value) return

  const controller = new AbortController()
  abort = controller
  regenerating.value = true
  regenerateError.value = null

  try {
    const result = await regenerateFlyer(draft.value, feedback, slideIndex.value, description.value, controller.signal)
    if (controller.signal.aborted) return
    draft.value = result
    slideIndex.value = Math.min(slideIndex.value, result.flyer.slides.length - 1)
    regenerateOpen.value = false
  } catch (caught) {
    if (controller.signal.aborted) return
    regenerateError.value = caught instanceof Error ? caught.message : "Couldn't regenerate the slides"
  } finally {
    regenerating.value = false
  }
}

function goToSchedule() {
  if (!draft.value) return
  schedule.type = draft.value.flyer.type
  schedule.endDate = draft.value.flyer.endDate
  scheduleError.value = null
  step.value = 3
}

function reviewAndPublish() {
  const result = FlyerInputSchema.safeParse(scheduledFlyer.value)
  if (!result.success) {
    scheduleError.value = result.error.issues[0]?.message ?? 'Check the schedule'
    return
  }
  scheduleError.value = null
  publishError.value = null
  confirmOpen.value = true
}

async function publish() {
  if (!scheduledFlyer.value) return
  publishing.value = true
  publishError.value = null
  try {
    await create(scheduledFlyer.value)
    await navigateTo('/')
  } catch (caught) {
    publishError.value = apiErrorMessage(caught, "Couldn't add it to the TV")
  } finally {
    publishing.value = false
  }
}

function startOver() {
  draft.value = null
  description.value = null
  clearFile()
  step.value = 1
}

function leave() {
  abort?.abort()
  return navigateTo('/flyers')
}

onBeforeUnmount(() => {
  abort?.abort()
  clearFile()
})
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-surface">
    <AppFlowHeader
      v-model="step"
      title="New flyer"
      :steps="steps"
      :organization-name="organization?.name"
      :logo="organization?.logo"
      @cancel="leave"
    />

    <main
      :class="[
        'flex w-full flex-col items-start px-8 pb-16',
        step === 3 ? 'max-w-[1184px] gap-8 pt-10' : 'max-w-[1024px] gap-6 pt-12',
      ]"
    >
      <template v-if="step === 1 && !reading">
        <h1 class="heading-h1 text-primary">Upload a flyer</h1>
        <p class="body-md text-secondary">
          AI turns it into slides that read from across the gym. Nothing plays until you approve it.
        </p>

        <UploadDropzone
          :accept="ACCEPTED_TYPES"
          :max-bytes="MAX_BYTES"
          :hints="HINTS"
          :error="error"
          @select="startReading"
          @invalid="error = $event"
        />

        <UiButton variant="ghost" class="self-center" @click="generateOpen = true">
          No flyer? Tell AI what to generate
        </UiButton>

        <UiDialog
          v-model:open="generateOpen"
          title="Tell AI what to generate"
          description="AI turns your note into slides, the same way it reads a flyer. You'll review every slide before anything plays."
        >
          <label for="generate-description" class="sr-only">What should go on the TV</label>
          <textarea
            id="generate-description"
            v-model="generateText"
            rows="9"
            :maxlength="MAX_DESCRIPTION"
            :placeholder="DESCRIPTION_PLACEHOLDER"
            class="body-md w-full resize-none rounded-md border border-subtle bg-raised p-4 text-primary transition-colors placeholder:text-disabled hover:border-strong focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus"
            @keydown.meta.enter.prevent="startGenerating"
            @keydown.ctrl.enter.prevent="startGenerating"
          />
          <p class="caption text-secondary">
            Headlines fit up to 24 characters, so keep names short. Times like "6 PM" or "18:00" both work.
          </p>

          <template #actions>
            <UiButton variant="secondary" @click="generateOpen = false">Cancel</UiButton>
            <UiButton :disabled="generateText.trim().length < MIN_DESCRIPTION" @click="startGenerating">Generate slides</UiButton>
          </template>
        </UiDialog>
      </template>

      <UploadReadingCard
        v-else-if="step === 1 && reading"
        :file-name="file?.name ?? 'Your description'"
        :description="description"
        :image-url="previewUrl"
        :stage="progress.stage"
        :found="progress.found"
        :retrying="progress.retrying"
        @cancel="cancelReading"
      />

      <template v-else-if="step === 2 && draft">
        <FlyerDraftPreview
          v-model:slide-index="slideIndex"
          v-model:regenerate-open="regenerateOpen"
          :draft="draft"
          :regenerating="regenerating"
          :regenerate-error="regenerateError"
          @regenerate="regenerate"
          :brand="organization?.brand"
        />

        <div class="h-px w-full bg-action-soft" aria-hidden="true" />
        <footer class="flex w-full items-start justify-between">
          <UiButton variant="secondary" :disabled="regenerating" @click="reviewBack">Back</UiButton>
          <UiButton :disabled="regenerating" @click="reviewNext">{{ isLastSlide ? 'Next: Schedule' : 'Next slide' }}</UiButton>
        </footer>
      </template>

      <template v-else-if="step === 3 && scheduledFlyer && draft">
        <FlyerSchedule
          v-model:type="schedule.type"
          v-model:end-date="schedule.endDate"
          :flyer="scheduledFlyer"
          :suggested-type="draft.flyer.type"
          :gym-hours="organization?.gymHours"
          :brand="organization?.brand"
          :error="scheduleError"
          @edit-slides="step = 2"
        />

        <div class="h-px w-full bg-action-soft" aria-hidden="true" />
        <footer class="flex w-full items-start justify-between">
          <UiButton variant="secondary" @click="step = 2">Back</UiButton>
          <UiButton @click="reviewAndPublish">Review and publish</UiButton>
        </footer>

        <FlyerPublishDialog
          v-model:open="confirmOpen"
          :flyer="scheduledFlyer"
          :live-flyers="liveFlyers"
          :timezone="timezone"
          :brand="organization?.brand"
          :publishing="publishing"
          :error="publishError"
          @publish="publish"
        />
      </template>
    </main>
  </div>
</template>
