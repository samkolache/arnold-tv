<script setup lang="ts">
import type { Flyer } from '~/types/flyer'

definePageMeta({ layout: 'dashboard' })

const flyers: Flyer[] = [
  { id: 'holiday-hours', title: 'Holiday hours', meta: 'comes off after Nov 27', image: '/example-flyer.png', slides: 2 },
  { id: 'boxing', title: 'Boxing & Kickboxing', meta: 'Free class schedule · weekly', image: '/example-flyer.png' },
  { id: 'afrobeats-yoga', title: 'Afrobeats Yoga', meta: 'Free class schedule · weekly', image: '/example-flyer.png' },
  { id: 'yoga-sebastien', title: 'Yoga w/ Sebastien', meta: 'Free class schedule · weekly', image: '/example-flyer.png' },
]
</script>

<template>
  <div class="space-y-8">
    <header class="flex items-start justify-between">
      <div class="space-y-1">
        <p class="label-micro text-secondary">Thursday, Oct 29 · 5:18 PM</p>
        <h1 class="heading-h1">Good evening</h1>
      </div>
      <UiButton>+ New Flyer</UiButton>
    </header>

    <DashboardInformationalSlideCard
      :flyers="flyers"
      :active-index="0"
      status="Online · checked 1 min ago"
      :progress="83"
      :seconds-until-next="4"
      :loop-seconds="50"
    />

    <div class="grid grid-cols-3 gap-6">
      <section class="col-span-2 space-y-3">
        <h2 class="heading-h2">Results this week</h2>
        <div class="grid grid-cols-3 gap-4">
          <DashboardStatCard label="QR scans" :stat="42" caption="vs 30 last week" />
          <DashboardStatCard label="Class Signups" :stat="10" caption="vs 15 last week" />
          <DashboardStatCard label="Top Flyer" stat="Yoga with Adrienne" caption="vs Boxing with Ken last week"  />
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="heading-h2">Needs attention</h2>
        <DashboardAttentionCard
          ai
          title="AI wasn't sure about 1 class time"
          description="Free class schedule · Yoga w/ Sebastien"
        />
        <p class="caption text-secondary">
          That's all. Flyers come off the TV on their own when their dates pass.
        </p>
      </section>
    </div>
  </div>
</template>
