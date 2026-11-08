<script setup lang="ts">
import { Calendar, ClipboardCheck, Mail, Search, Upload } from 'lucide-vue-next'

definePageMeta({
  middleware: () => {
    if (!import.meta.dev) return abortNavigation(createError({ statusCode: 404, statusMessage: 'Page not found' }))
  },
})

const variants = ['primary', 'secondary', 'ghost', 'link', 'danger'] as const
const sizes = ['sm', 'md', 'lg'] as const
const NuxtLink = resolveComponent('NuxtLink')

const steps = [
  { title: 'Upload', icon: Upload },
  { title: 'Review', icon: ClipboardCheck },
  { title: 'Schedule', icon: Calendar },
]
const currentStep = ref(1)

const inputSizes = ['sm', 'md', 'lg'] as const
const flyerTitle = ref('')
const email = ref('not-an-email')
const emailError = computed(() =>
  email.value && !email.value.includes('@') ? 'Enter a valid email address' : undefined,
)

const progressVariants = ['primary', 'success', 'warning', 'error', 'pop'] as const
const progressSizes = ['sm', 'md', 'lg'] as const
const uploadProgress = ref(40)

const cardVariants = ['default', 'emphasis'] as const
const cardPaddings = ['none', 'sm', 'md', 'lg'] as const
</script>

<template>
  <main class="mx-auto max-w-5xl space-y-10 p-10">
    <header class="space-y-1">
      <h1 class="heading-h1">Button playground</h1>
      <p class="body-sm text-secondary">
        Hover, click and Tab through the buttons to see the hover, pressed and focus states.
      </p>
    </header>

    <section
      v-for="variant in variants"
      :key="variant"
      class="space-y-4 rounded-lg border border-subtle bg-surface p-6"
    >
      <h2 class="label-micro text-secondary">{{ variant }}</h2>

      <!-- Sizes -->
      <div class="flex flex-wrap items-center gap-4">
        <UiButton v-for="size in sizes" :key="size" :variant="variant" :size="size">
          New flyer
        </UiButton>
      </div>

      <!-- States -->
      <div class="flex flex-wrap items-center gap-4">
        <UiButton :variant="variant">New flyer</UiButton>
        <UiButton :variant="variant" disabled>New flyer</UiButton>
        <UiButton :variant="variant" loading>New flyer</UiButton>
        <UiButton :variant="variant" :as="NuxtLink" to="/playground">
          New flyer
        </UiButton>
      </div>

      <p class="caption text-secondary">
        Row 1: sm · md · lg — Row 2: default · disabled · loading · rendered as a NuxtLink
      </p>
    </section>

    <section class="space-y-6 rounded-lg border border-subtle bg-surface p-6">
      <h2 class="label-micro text-secondary">stepper</h2>

      <UiStepper v-model="currentStep" :steps="steps" />

      <div class="flex items-center justify-center gap-4">
        <UiButton variant="secondary" size="sm" :disabled="currentStep <= 1" @click="currentStep--">
          Back
        </UiButton>
        <UiButton size="sm" :disabled="currentStep >= steps.length" @click="currentStep++">
          Next
        </UiButton>
        <span class="caption text-secondary">Step {{ currentStep }} of {{ steps.length }}</span>
      </div>
    </section>

    <section class="space-y-6 rounded-lg border border-subtle bg-surface p-6">
      <h2 class="label-micro text-secondary">input</h2>

      <!-- Sizes -->
      <div class="grid gap-4 sm:grid-cols-3">
        <UiInput
          v-for="size in inputSizes"
          :key="size"
          :size="size"
          :label="`Size ${size}`"
          placeholder="Flyer title"
        />
      </div>

      <!-- States -->
      <div class="grid gap-6 sm:grid-cols-2">
        <UiInput
          v-model="flyerTitle"
          label="Flyer title"
          description="Shown at the top of the flyer."
          placeholder="Spring open house"
          required
        />
        <UiInput
          v-model="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          :icon="Mail"
          :error="emailError"
        />
        <UiInput label="Search" placeholder="Search flyers…" :icon="Search" />
        <UiInput label="Disabled" placeholder="Can't edit this" disabled />
      </div>

      <p class="caption text-secondary">
        Flyer title value: "{{ flyerTitle }}" — type an @ in the email field to clear the error.
      </p>
    </section>

    <section class="space-y-6 rounded-lg border border-subtle bg-surface p-6">
      <h2 class="label-micro text-secondary">avatar</h2>

      <div class="flex flex-wrap items-center gap-4">
        <UiAvatar v-for="size in sizes" :key="`name-${size}`" name="Arnold" :size="size" />
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <UiAvatar
          v-for="size in sizes"
          :key="`image-${size}`"
          name="Arnold"
          src="/arnold-logo.jpeg"
          :size="size"
        />
      </div>

      <p class="caption text-secondary">
        Row 1: name only (fallback initial) — Row 2: image from /public/arnold-logo.jpeg
      </p>
    </section>

    <section class="space-y-6 rounded-lg border border-subtle bg-surface p-6">
      <h2 class="label-micro text-secondary">progress</h2>

      <div class="space-y-3">
        <UiProgress v-model="uploadProgress" label="Uploading flyer" show-value />
        <div class="flex items-center gap-4">
          <UiButton variant="secondary" size="sm" :disabled="uploadProgress <= 0" @click="uploadProgress = Math.max(0, uploadProgress - 10)">
            -10
          </UiButton>
          <UiButton size="sm" :disabled="uploadProgress >= 100" @click="uploadProgress = Math.min(100, uploadProgress + 10)">
            +10
          </UiButton>
        </div>
      </div>

      <div class="space-y-4">
        <UiProgress
          v-for="variant in progressVariants"
          :key="variant"
          :model-value="65"
          :variant="variant"
          :label="variant"
        />
      </div>

      <div class="space-y-4">
        <UiProgress
          v-for="size in progressSizes"
          :key="size"
          :model-value="50"
          :size="size"
          :label="`Size ${size}`"
        />
      </div>

      <UiProgress :model-value="null" label="Processing (indeterminate)" />

      <p class="caption text-secondary">
        Row 1: interactive — then variants, sizes, and indeterminate (value = null)
      </p>
    </section>

    <section class="space-y-6 rounded-lg border border-subtle bg-canvas p-6">
      <h2 class="label-micro text-secondary">card</h2>

      <div class="grid gap-4 sm:grid-cols-4">
        <DashboardStatCard label="QR scans" :stat="1284" caption="vs 1,102 last week" />
        <DashboardStatCard label="Class sign-ups" :stat="37" caption="from the TV" />
        <DashboardStatCard label="Top flyer" stat="Boxing & Kickboxing Winter Schedule" caption="412 scans" />
        <DashboardStatCard label="No caption" :stat="8" />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UiCard v-for="variant in cardVariants" :key="variant" :variant="variant">
          <p class="label-micro text-secondary">variant</p>
          <p class="heading-h3">{{ variant }}</p>
        </UiCard>
      </div>

      <div class="grid gap-4 sm:grid-cols-4">
        <UiCard v-for="padding in cardPaddings" :key="padding" :padding="padding">
          <div class="rounded-sm bg-sunken p-2 caption text-secondary">padding {{ padding }}</div>
        </UiCard>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <UiCard padding="sm">
          <p class="label-micro text-secondary">QR scans</p>
          <p class="heading-h2">##</p>
          <p class="caption text-secondary">vs ## last week</p>
        </UiCard>
        <UiCard variant="emphasis" class="space-y-3">
          <div>
            <p class="heading-h3">AI wasn't sure about 1 class time</p>
            <p class="caption text-secondary">Free class schedule · Yoga w/ Sebastien</p>
          </div>
          <UiButton variant="secondary" size="sm">Check it</UiButton>
        </UiCard>
        <UiCard as-child class="block transition-colors hover:border-strong">
          <NuxtLink to="/playground">
            <p class="heading-h3">as-child</p>
            <p class="caption text-secondary">Whole card is a NuxtLink</p>
          </NuxtLink>
        </UiCard>
      </div>

      <p class="caption text-secondary">
        Row 1: variants — Row 2: paddings — Row 3: stat card, needs attention, clickable card via as-child
      </p>
    </section>
  </main>
</template>
