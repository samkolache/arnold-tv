<script setup lang="ts">
import { computed } from 'vue'
import { Copy, Ellipsis, Pause, Pencil } from 'lucide-vue-next'
import type { FlyerPreview } from '~/types/flyer'

interface Props {
    flyer: FlyerPreview
    status?: string
    scans?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
    edit: []
    pause: []
    duplicate: []
}>()

const meta = computed(() =>
    props.flyer.slides
        ? `${props.flyer.slides} ${props.flyer.slides === 1 ? 'slide' : 'slides'} · ${props.flyer.meta}`
        : props.flyer.meta,
)
</script>

<template>
    <UiCard padding="none" data-slot="flyer-card" class="flex flex-col overflow-hidden">
        <UiCardThumbnail :src="flyer.image" :alt="flyer.title" />

        <UiCardBody>
            <div data-slot="flyer-card-header" class="flex items-start justify-between gap-2">
                <div data-slot="flyer-card-heading" class="flex min-w-0 flex-1 flex-col gap-0.5">
                    <h3 data-slot="flyer-card-title" class="heading-h2 truncate text-primary">
                        {{ flyer.title }}
                    </h3>
                    <p data-slot="flyer-card-meta" class="caption truncate text-secondary">
                        {{ meta }}
                    </p>
                </div>

                <UiPopover>
                    <template #trigger>
                        <UiButton
                            variant="ghost"
                            size="sm"
                            :aria-label="`Actions for ${flyer.title}`"
                            data-slot="flyer-card-actions"
                            class="border border-subtle"
                        >
                            <Ellipsis class="size-4 text-primary" aria-hidden="true" />
                        </UiButton>
                    </template>

                    <UiPopoverItem :icon="Pencil" @click="emit('edit')">Edit</UiPopoverItem>
                    <UiPopoverItem :icon="Pause" @click="emit('pause')">Pause</UiPopoverItem>
                    <UiPopoverItem :icon="Copy" @click="emit('duplicate')">Duplicate</UiPopoverItem>
                </UiPopover>
            </div>

            <div data-slot="flyer-card-details" class="mt-2 flex flex-col gap-0.5">
                <p v-if="status" data-slot="flyer-card-status" class="body-sm font-semibold text-primary">
                    {{ status }}
                </p>
                <p v-if="scans !== undefined" data-slot="flyer-card-scans" class="caption text-secondary">
                    {{ scans.toLocaleString() }} QR scans
                </p>
            </div>
        </UiCardBody>
    </UiCard>
</template>
