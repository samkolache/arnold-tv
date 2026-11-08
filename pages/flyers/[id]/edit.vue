<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui'
import { FlyerInputSchema, type SlideInput } from '~/types'

definePageMeta({ layout: false })

const DURATIONS = [5, 10, 15, 20, 30]
const LIMITS = { headline: 24, tag: 14, when: 28, supportingLine: 40 } as const

type TextField = 'tag' | 'when' | 'supportingLine' | 'qrLabel'

const route = useRoute()
const [{ data: organization }, { data: flyers }] = await Promise.all([useOrganization(), useFlyers()])
const { update } = useFlyerActions()

const flyer = computed(() => flyers.value.find((item) => item.id === route.params.id) ?? null)

const title = ref(flyer.value?.title ?? '')
const slides = ref<SlideInput[]>(structuredClone(toRaw(flyer.value?.slides ?? [])))
const selectedIndex = ref(0)
const saving = ref(false)
const error = ref<string | null>(null)

const selected = computed(() => slides.value[selectedIndex.value])
const loopSeconds = computed(() => totalSeconds(slides.value))
const durationOptions = computed(() =>
  [...new Set([...DURATIONS, selected.value?.durationSeconds ?? SECONDS_PER_SLIDE])].sort((a, b) => a - b),
)

const dirty = computed(() =>
  !!flyer.value
  && (title.value !== flyer.value.title || JSON.stringify(slides.value) !== JSON.stringify(flyer.value.slides)),
)

function setText(field: TextField, value: string | number | undefined) {
  if (selected.value) selected.value[field] = String(value ?? '') || null
}

function count(value: string | null | undefined, max: number) {
  return `${value?.length ?? 0}/${max}`
}

function deleteSlide(index: number) {
  if (slides.value.length <= 1) return
  slides.value.splice(index, 1)
  selectedIndex.value = Math.min(selectedIndex.value, slides.value.length - 1)
}

function cleanText(value: string | null) {
  return value?.trim() || null
}

async function save() {
  if (!flyer.value) return

  const cleaned = slides.value.map((slide) => ({
    ...slide,
    headline: slide.headline.trim(),
    tag: cleanText(slide.tag),
    when: cleanText(slide.when),
    supportingLine: cleanText(slide.supportingLine),
    qrLabel: cleanText(slide.qrLabel),
  }))

  const result = FlyerInputSchema.safeParse({ ...flyer.value, title: title.value.trim(), slides: cleaned })
  if (!result.success) {
    const issue = result.error.issues[0]
    const index = issue?.path[0] === 'slides' ? Number(issue.path[1]) : null
    if (index !== null && !Number.isNaN(index)) selectedIndex.value = index
    error.value = issue?.path.includes('headline')
      ? `Slide ${(index ?? 0) + 1} needs a headline`
      : issue?.path[0] === 'title' ? 'Give the flyer a name' : issue?.message ?? 'Check your changes'
    return
  }

  saving.value = true
  error.value = null
  try {
    await update(flyer.value, { title: result.data.title, slides: result.data.slides })
    await navigateTo('/flyers')
  } catch (caught) {
    error.value = apiErrorMessage(caught, "Couldn't save your changes")
  } finally {
    saving.value = false
  }
}

useHead({ title: () => `Edit ${flyer.value?.title ?? 'flyer'}` })
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-surface">
    <AppFlowHeader
      title="Edit flyer"
      :organization-name="organization?.name"
      :logo="organization?.logo"
      @cancel="navigateTo('/flyers')"
    />

    <main v-if="!flyer" class="flex w-full max-w-[1184px] flex-col items-start gap-4 px-8 pt-10">
      <h1 class="heading-h1 text-primary">Flyer not found</h1>
      <p class="body-md text-secondary">It may have been deleted.</p>
      <UiButton variant="secondary" @click="navigateTo('/flyers')">Back to flyers</UiButton>
    </main>

    <main v-else class="flex w-full max-w-[1184px] flex-col items-start gap-8 px-8 pb-16 pt-10">
      <UiInput v-model="title" label="Flyer name" maxlength="80" class="w-[480px]" />

      <div data-slot="flyer-edit-body" class="flex w-full items-start gap-8">
        <aside data-slot="flyer-edit-slides" class="flex w-[300px] shrink-0 flex-col gap-3">
          <div class="flex items-baseline justify-between">
            <p class="label-micro text-secondary">Slides</p>
            <p class="caption text-secondary">{{ slides.length }} {{ slides.length === 1 ? 'slide' : 'slides' }} · {{ loopSeconds }} s on screen</p>
          </div>

          <ul class="flex flex-col gap-2">
            <li
              v-for="(slide, index) in slides"
              :key="slide.id ?? index"
              data-slot="flyer-edit-slide"
              :data-state="index === selectedIndex ? 'active' : 'inactive'"
              :class="[
                'flex items-center gap-3 rounded-md border p-2 transition-colors',
                index === selectedIndex ? 'border-action-primary bg-raised' : 'border-subtle bg-raised hover:border-strong',
              ]"
            >
              <button
                type="button"
                class="flex min-w-0 flex-1 items-center gap-3 rounded-sm text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus"
                :aria-current="index === selectedIndex ? 'true' : undefined"
                @click="selectedIndex = index"
              >
                <div class="w-24 shrink-0 overflow-hidden rounded-sm">
                  <TvSlide :slide="slide" :brand="organization?.brand" />
                </div>
                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="label-field truncate text-primary">{{ slide.headline || 'Untitled slide' }}</span>
                  <span class="caption text-secondary">{{ slide.durationSeconds }} s</span>
                </span>
              </button>
              <UiButton
                variant="ghost"
                size="sm"
                :aria-label="`Delete slide ${index + 1}`"
                :title="slides.length <= 1 ? 'A flyer needs at least one slide' : 'Delete slide'"
                :disabled="slides.length <= 1"
                @click="deleteSlide(index)"
              >
                <Trash2 class="size-4" aria-hidden="true" />
              </UiButton>
            </li>
          </ul>
        </aside>

        <section v-if="selected" data-slot="flyer-edit-slide-editor" class="flex min-w-0 flex-1 flex-col gap-6">
          <TvSlide :slide="selected" :brand="organization?.brand" class="rounded-lg shadow-card" />

          <div class="grid grid-cols-2 gap-x-6 gap-y-4">
            <UiInput
              v-model="selected.headline"
              label="Headline"
              required
              :maxlength="LIMITS.headline"
              :description="count(selected.headline, LIMITS.headline)"
            />
            <UiInput
              :model-value="selected.tag ?? ''"
              label="Tag"
              :maxlength="LIMITS.tag"
              :description="selected.tag ? count(selected.tag, LIMITS.tag) : 'Leave empty to use the default tag'"
              @update:model-value="setText('tag', $event)"
            />
            <UiInput
              :model-value="selected.when ?? ''"
              label="When"
              :maxlength="LIMITS.when"
              :description="count(selected.when, LIMITS.when)"
              @update:model-value="setText('when', $event)"
            />
            <UiInput
              :model-value="selected.supportingLine ?? ''"
              label="Supporting line"
              :maxlength="LIMITS.supportingLine"
              :description="count(selected.supportingLine, LIMITS.supportingLine)"
              @update:model-value="setText('supportingLine', $event)"
            />
          </div>

          <div class="flex flex-col gap-2">
            <p id="slide-duration-label" class="label-field text-primary">Time on screen</p>
            <RadioGroupRoot
              v-model="selected.durationSeconds"
              aria-labelledby="slide-duration-label"
              orientation="horizontal"
              class="flex flex-wrap gap-2"
            >
              <RadioGroupItem
                v-for="seconds in durationOptions"
                :key="seconds"
                :value="seconds"
                data-slot="flyer-edit-duration"
                class="label-button rounded-full border border-subtle bg-raised px-4 py-1.5 text-primary transition-colors hover:border-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus data-[state=checked]:border-action-primary data-[state=checked]:bg-action-primary data-[state=checked]:text-on-inverse"
              >
                {{ seconds }} s
              </RadioGroupItem>
            </RadioGroupRoot>
          </div>
        </section>
      </div>

      <p v-if="error" role="alert" class="body-sm w-full rounded-md bg-status-error-bg p-3 text-status-error-text">{{ error }}</p>

      <div class="h-px w-full bg-action-soft" aria-hidden="true" />
      <footer class="flex w-full items-center justify-between">
        <UiButton variant="secondary" @click="navigateTo('/flyers')">Cancel</UiButton>
        <UiButton :loading="saving" :disabled="!dirty" @click="save">Save changes</UiButton>
      </footer>
    </main>
  </div>
</template>
