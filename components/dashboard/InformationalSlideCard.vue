<script setup lang="ts">
import { computed } from 'vue'
import type { FlyerPreview } from '~/types/flyer'

interface Props {
    flyers: FlyerPreview[]
    activeIndex?: number
    status?: string
    progress: number
    secondsUntilNext: number
    loopSeconds: number
    manageTo?: string
}

const props = withDefaults(defineProps<Props>(), {
    activeIndex: 0,
})

const emit = defineEmits<{
    manage: []
}>()

const activeFlyer = computed(() => props.flyers[props.activeIndex])

const nextFlyer = computed(() => props.flyers[(props.activeIndex + 1) % props.flyers.length])
</script>

<template>
    <UiCard
        variant="emphasis"
        padding="md"
        data-slot="informational-slide-card"
        class="grid grid-cols-[auto_minmax(0,1fr)] gap-6"
    >
        <section data-slot="informational-slide-card-now" class="flex w-fit flex-col">
            <header data-slot="informational-slide-card-header" class="flex items-baseline gap-3">
                <h2 data-slot="informational-slide-card-title" class="heading-h3 text-primary">
                    On the gym TV now
                </h2>
                <p v-if="status" data-slot="informational-slide-card-status" class="body-sm text-secondary">
                    {{ status }}
                </p>
            </header>

            <img
                v-if="activeFlyer?.image"
                :src="activeFlyer.image"
                :alt="`Live preview: ${activeFlyer.title}`"
                data-slot="informational-slide-card-preview"
                class="mt-4 aspect-video h-[400px] rounded-md bg-sunken object-cover"
            >
            <div
                v-else
                data-slot="informational-slide-card-preview"
                class="mt-4 flex aspect-video h-[400px] items-center justify-center rounded-md bg-sunken p-6 text-center"
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
                v-if="nextFlyer"
                data-slot="informational-slide-card-next"
                class="caption mt-1 text-secondary"
            >
                Next in {{ secondsUntilNext }} s: {{ nextFlyer.title }}
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
