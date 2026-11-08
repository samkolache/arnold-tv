<script setup lang="ts">
import type { Flyer } from '~/types/flyer'

definePageMeta({ layout: 'dashboard' })

interface FlyerListing {
  flyer: Flyer
  status: string
  scans?: number
}

const onTv: FlyerListing[] = [
  {
    flyer: { id: 'holiday-hours', title: 'Holiday hours', meta: 'one-time event', image: '/example-flyer.png', slides: 2 },
    status: 'Comes off after Nov 27',
    scans: 42,
  },
  {
    flyer: { id: 'free-class-schedule', title: 'Free class schedule', meta: 'weekly classes', image: '/example-flyer.png', slides: 3 },
    status: 'Plays until you remove it',
    scans: 18,
  },
]

const scheduled: FlyerListing[] = [
  {
    flyer: { id: 'smoothie-bar', title: 'Smoothie bar', meta: 'one-time event', image: '/example-flyer.png', slides: 1 },
    status: 'Starts Mon, Nov 2 · off after Nov 9',
  },
]
</script>

<template>
  <div class="space-y-8">
    <header class="flex items-start justify-between">
      <h1 class="heading-h1">Flyers</h1>
      <UiButton>+ New flyer</UiButton>
    </header>

    <section class="space-y-4">
      <h2 class="heading-h2">On the TV now · 2</h2>
      <div class="grid grid-cols-3 gap-6">
        <DashboardFlyerCard
          v-for="listing in onTv"
          :key="listing.flyer.id"
          :flyer="listing.flyer"
          :status="listing.status"
          :scans="listing.scans"
        />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="heading-h2">Scheduled · 1</h2>
      <div class="grid grid-cols-3 gap-6">
        <DashboardFlyerCard
          v-for="listing in scheduled"
          :key="listing.flyer.id"
          :flyer="listing.flyer"
          :status="listing.status"
          :scans="listing.scans"
        />
      </div>
    </section>
  </div>
</template>
