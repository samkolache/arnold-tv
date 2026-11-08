<script setup lang="ts">
import { formatInTimeZone } from 'date-fns-tz'
import type { WeekTotals } from '~/types'

definePageMeta({ layout: 'dashboard' })

const [
  { data: organization, error: organizationError },
  { data: flyers, error: flyersError },
  { data: stats, error: statsError },
  { data: aiIssues, error: aiIssuesError },
] = await Promise.all([useOrganization(), useFlyers(), useWeeklyStats(), useAiIssues()])

const loadError = computed(() => organizationError.value ?? flyersError.value ?? statsError.value ?? aiIssuesError.value)

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 1000) })
const timezone = computed(() => organization.value?.timezone ?? 'UTC')

const today = computed(() => formatInTimeZone(now.value, timezone.value, 'EEEE, MMM d · h:mm a'))

const greeting = computed(() => {
  const hour = Number(formatInTimeZone(now.value, timezone.value, 'H'))
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const rotation = computed(() => buildRotation(flyers.value, timezone.value, now.value))
const position = computed(() => getRotationPosition(rotation.value, now.value.getTime()))

const attention = computed(() => groupAiIssues(aiIssues.value, flyers.value))

function topSlideCaption(thisWeek: WeekTotals, lastWeek: WeekTotals) {
  if (!thisWeek.topSlide) return 'No scans yet this week'
  if (!lastWeek.topSlide) return `${thisWeek.topSlide.scans} scans`
  if (lastWeek.topSlide.slideId === thisWeek.topSlide.slideId) return `${thisWeek.topSlide.scans} scans · top last week too`
  return `vs ${lastWeek.topSlide.headline} last week`
}
</script>

<template>
  <div class="space-y-8">
    <header class="flex items-start justify-between">
      <div class="space-y-1">
        <ClientOnly>
          <p class="label-micro text-secondary">{{ today }}</p>
        </ClientOnly>
        <h1 class="heading-h1">{{ greeting }}</h1>
      </div>
      <UiButton>+ New Flyer</UiButton>
    </header>

    <p v-if="loadError" class="body-sm text-secondary">
      Couldn't load your gym's data: {{ loadError.statusMessage ?? loadError.message }}
    </p>

    <ClientOnly>
      <DashboardInformationalSlideCard
        :flyers="rotation"
        :active-index="position.activeIndex"
        :progress="position.progress"
        :seconds-until-next="position.secondsUntilNext"
        :loop-seconds="position.loopSeconds"
        manage-to="/flyers"
      />
    </ClientOnly>

    <div class="grid grid-cols-3 gap-6">
      <section class="col-span-2 space-y-3">
        <h2 class="heading-h2">Results this week</h2>
        <div v-if="stats" class="grid grid-cols-3 gap-4">
          <DashboardStatCard
            label="QR scans"
            :stat="stats.scans"
            :caption="`vs ${stats.lastWeek.scans.toLocaleString()} last week`"
          />
          <DashboardStatCard
            label="Class Signups"
            :stat="stats.signUps"
            :caption="`vs ${stats.lastWeek.signUps.toLocaleString()} last week`"
          />
          <DashboardStatCard
            label="Top Class"
            :stat="stats.topSlide?.headline ?? '—'"
            :caption="topSlideCaption(stats, stats.lastWeek)"
          />
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="heading-h2">Needs attention</h2>
        <DashboardAttentionCard
          v-for="item in attention"
          :key="item.id"
          ai
          :title="item.title"
          :description="item.description"
          to="/flyers"
        />
        <p class="caption text-secondary">
          {{ attention.length ? "That's all." : 'Nothing needs you right now.' }}
          Flyers come off the TV on their own when their dates pass.
        </p>
      </section>
    </div>
  </div>
</template>
