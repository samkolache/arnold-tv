<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import type { FlyerPreview } from '~/types/flyer'

interface Props {
    flyers: FlyerPreview[]
    activeIndex?: number
    loopSeconds: number
    manageTo?: string
}

const props = withDefaults(defineProps<Props>(), {
    activeIndex: 0,
})

const emit = defineEmits<{
    manage: []
}>()

const NuxtLink = resolveComponent('NuxtLink')

const slideCount = computed(() =>
    props.flyers.reduce((total, flyer) => total + (flyer.slides ?? 1), 0),
)

const formatTitle = (flyer: FlyerPreview) =>
    flyer.slides && flyer.slides > 1 ? `${flyer.title} · ${flyer.slides} slides` : flyer.title
</script>

<template>
    <div data-slot="flyer-rotation" class="flex h-full min-w-0 flex-col justify-between gap-4">
        <div data-slot="flyer-rotation-top" class="flex flex-col gap-3">
            <div data-slot="flyer-rotation-header" class="flex items-center justify-between gap-2 text-secondary">
                <p data-slot="flyer-rotation-label" class="label-micro">Rotation</p>
                <p data-slot="flyer-rotation-summary" class="caption">
                    {{ slideCount }} slides · {{ loopSeconds }} s loop
                </p>
            </div>

            <ul data-slot="flyer-rotation-list" class="flex flex-col gap-1">
                <li
                    v-for="(flyer, index) in flyers"
                    :key="flyer.id"
                    data-slot="flyer-rotation-item"
                    :data-state="index === activeIndex ? 'active' : 'inactive'"
                    :aria-current="index === activeIndex ? 'true' : undefined"
                    class="flex items-center gap-3 rounded-md p-2 transition-colors duration-150 data-[state=active]:bg-sunken"
                >
                    <img
                        v-if="flyer.image"
                        :src="flyer.image"
                        alt=""
                        data-slot="flyer-rotation-thumbnail"
                        class="h-9 w-16 shrink-0 rounded-sm object-cover"
                    >
                    <div
                        v-else
                        data-slot="flyer-rotation-thumbnail"
                        class="h-9 w-16 shrink-0 rounded-sm bg-sunken"
                    />
                    <div data-slot="flyer-rotation-text" class="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p data-slot="flyer-rotation-title" class="heading-h3 truncate text-primary">
                            {{ formatTitle(flyer) }}
                        </p>
                        <p data-slot="flyer-rotation-meta" class="caption truncate text-secondary">
                            <template v-if="index === activeIndex">Playing · </template>{{ flyer.meta }}
                        </p>
                    </div>
                </li>
            </ul>
        </div>

        <UiButton
            variant="ghost"
            size="sm"
            :as="manageTo ? NuxtLink : 'button'"
            :to="manageTo"
            data-slot="flyer-rotation-manage"
            class="-ml-3 self-start"
            @click="emit('manage')"
        >
            Manage flyers
            <ArrowRight class="size-4" aria-hidden="true" />
        </UiButton>
    </div>
</template>
