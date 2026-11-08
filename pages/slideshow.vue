<script setup lang="ts">
import type { Flyer, Organization } from '~/types'

definePageMeta({ layout: false })

const REFRESH_MS = 60_000

const [
  { data: organization, error: organizationError, refresh: refreshOrganization },
  { data: flyers, error: flyersError, refresh: refreshFlyers },
] = await Promise.all([useOrganization(), useFlyers()])

const shownOrganization = shallowRef<Organization | null>(organization.value ?? null)
const shownFlyers = shallowRef<Flyer[]>(flyers.value)

watch(organization, (value) => {
  if (value && !organizationError.value) shownOrganization.value = value
})

watch(flyers, (value) => {
  if (!flyersError.value) shownFlyers.value = value
})

useIntervalFn(() => Promise.all([refreshOrganization(), refreshFlyers()]), REFRESH_MS)

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 250) })
const timezone = computed(() => shownOrganization.value?.timezone ?? 'UTC')

const rotation = computed(() => buildSlideRotation(shownFlyers.value, timezone.value, now.value))
const position = computed(() => getRotationPosition(rotation.value, now.value.getTime()))
const current = computed(() => rotation.value[position.value.activeIndex] ?? null)

const { request: requestWakeLock } = useWakeLock()
onMounted(() => requestWakeLock('screen').catch(() => {}))

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen().catch(() => {})
}

useHead({ title: 'TV' })
</script>

<template>
  <main
    data-slot="slideshow"
    class="flex h-screen w-screen cursor-none items-center justify-center overflow-hidden bg-inverse"
    @dblclick="toggleFullscreen"
  >
    <div
      data-slot="slideshow-stage"
      class="slideshow-stage relative aspect-video"
    >
      <Transition name="slideshow-fade">
        <TvSlide
          v-if="current"
          :slide="current.slide"
          :transition-key="current.id"
          :brand="shownOrganization?.brand"
          class="absolute inset-0"
        />
        <div
          v-else
          data-slot="slideshow-empty"
          class="absolute inset-0 flex flex-col items-center justify-center gap-6 text-on-inverse"
        >
          <p class="heading-h1 opacity-80">Nothing is scheduled right now</p>
        </div>
      </Transition>
    </div>
  </main>
</template>

<style scoped>
.slideshow-stage {
  width: min(100vw, calc(100vh * 16 / 9));
}

.slideshow-fade-enter-active,
.slideshow-fade-leave-active {
  transition: opacity 600ms ease;
}

.slideshow-fade-enter-from,
.slideshow-fade-leave-to {
  opacity: 0;
}
</style>
