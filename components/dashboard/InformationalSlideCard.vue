<script setup lang="ts">
import { computed } from 'vue'
import type { Brand } from '~/types'
import type { FlyerPreview } from '~/types/flyer'
import type { RotationSlide } from '~/utils/rotation'

interface Props {
    flyers: FlyerPreview[]
    activeIndex?: number
    status?: string
    progress: number
    secondsUntilNext: number
    loopSeconds: number
    manageTo?: string
    slide?: RotationSlide | null
    nextSlide?: RotationSlide | null
    brand?: Brand | null
}

const props = withDefaults(defineProps<Props>(), {
    activeIndex: 0,
    slide: null,
    nextSlide: null,
    brand: null,
})

const emit = defineEmits<{
    manage: []
}>()

const activeFlyer = computed(() => props.flyers[props.activeIndex])
</script>

<template>
    <UiCard
        padding="md"
        data-slot="informational-slide-card"
        class="grid grid-cols-[auto_minmax(0,1fr)] gap-6 max-lg:grid-cols-1"
    >
        <section data-slot="informational-slide-card-now" class="flex w-fit flex-col max-lg:w-full">
            <header data-slot="informational-slide-card-header" class="flex items-baseline gap-3 max-sm:flex-wrap max-sm:gap-x-3 max-sm:gap-y-1">
                <h2 data-slot="informational-slide-card-title" class="heading-h3 text-primary">
                    On the gym TV now
                </h2>
                <p v-if="status" data-slot="informational-slide-card-status" class="body-sm text-secondary">
                    {{ status }}
                </p>
            </header>

            <div
                v-if="slide"
                data-slot="informational-slide-card-preview"
                class="mt-4 aspect-video h-[320px] overflow-hidden rounded-md max-lg:h-auto max-lg:w-full"
            >
                <TvSlide
                    :slide="slide.slide"
                    :transition-key="slide.id"
                    :brand="brand"
                />
            </div>
            <div
                v-else
                data-slot="informational-slide-card-preview"
                class="mt-4 flex aspect-video h-[320px] items-center justify-center rounded-md bg-sunken p-6 text-center max-lg:h-auto max-lg:w-full"
            >
                <p class="heading-h2 text-secondary">{{ activeFlyer?.title ?? 'Nothing on the TV right now' }}</p>
            </div>

            <UiProgress
                :model-value="progress"
                size="md"
                data-slot="informational-slide-card-progress"
                class="mt-2"
            />

            <p
                v-if="nextSlide"
                data-slot="informational-slide-card-next"
                class="caption mt-1 text-secondary"
            >
                Next in {{ secondsUntilNext }} s: {{ nextSlide.slide.headline }}
            </p>
        </section>

        <DashboardFlyerRotationView
            :flyers="flyers"
            :active-index="activeIndex"
            :loop-seconds="loopSeconds"
            :manage-to="manageTo"
            @manage="emit('manage')"
        />
    </UiCard>
</template>
