<script setup lang="ts">
import { SlideInputSchema, type SlideInput } from '~/types'

const { data: organization } = await useOrganization()

const SIGN_UP = 'https://example.com/sign-up'

const examples: SlideInput[] = [
  { kind: 'class', headline: 'Boxing / Kickboxing', days: ['tue', 'thu'], times: ['09:30', '10:30'], supportingLine: 'Bring water and a towel', signUpUrl: SIGN_UP },
  { kind: 'event', tag: 'THANKSGIVING', headline: 'Turkey Trot 5K', when: 'Thu, Nov 26 · 8 AM', supportingLine: 'Meet at the clubhouse', signUpUrl: SIGN_UP },
  { kind: 'hours', headline: 'Holiday gym hours', when: '6 AM – 8 PM, Nov 26–27', days: [], times: [] },
  { kind: 'closure', headline: 'Pool closed', when: 'Closed Mon, Nov 30', supportingLine: 'Annual resurfacing', days: [], times: [] },
  { kind: 'new', headline: 'New rowing machines', when: 'Available now', supportingLine: 'Ask the front desk for a demo', days: [], times: [], signUpUrl: SIGN_UP },
  { kind: 'announcement', headline: 'Wipe down equipment', supportingLine: 'Sprays are by the water fountain', days: [], times: [], signUpUrl: SIGN_UP },
].map((slide) => SlideInputSchema.parse({ days: [], times: [], ...slide }))

const palettes = computed(() => [
  { title: 'Default colors', brand: null },
  ...(organization.value?.brand ? [{ title: `${organization.value.name} brand`, brand: organization.value.brand }] : []),
])
</script>

<template>
  <main class="mx-auto max-w-6xl space-y-10 p-10">
    <header class="space-y-1">
      <h1 class="heading-h1 text-primary">Slide kinds</h1>
      <p class="body-sm text-secondary">One example of every kind. The tag color, tag text and QR label come from the kind.</p>
    </header>

    <section
      v-for="palette in palettes"
      :key="palette.title"
      class="space-y-4 rounded-lg border border-subtle bg-surface p-6"
    >
      <h2 class="label-micro text-secondary">{{ palette.title }}</h2>
      <div class="grid gap-6 sm:grid-cols-2">
        <figure v-for="slide in examples" :key="slide.kind" class="min-w-0 space-y-2">
          <TvSlide :slide="slide" :brand="palette.brand" :logo="organization?.logo" class="rounded-lg shadow-card" />
          <figcaption class="label-field text-secondary">{{ slide.kind }}</figcaption>
        </figure>
      </div>
    </section>
  </main>
</template>
