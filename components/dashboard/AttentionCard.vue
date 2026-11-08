<script setup lang="ts">
import { resolveComponent } from 'vue'
import { Sparkles } from 'lucide-vue-next'

interface Props {
    title: string
    description?: string
    actionLabel?: string
    to?: string
    ai?: boolean
}

withDefaults(defineProps<Props>(), {
    actionLabel: 'Check it',
    ai: false,
})

const emit = defineEmits<{
    action: []
}>()

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
    <UiCard
        variant="emphasis"
        padding="md"
        data-slot="attention-card"
        class="flex min-w-0 flex-col items-start gap-3"
    >
        <div class="min-w-0 max-w-full mb-2" data-slot="attention-card-text">
            <p class="heading-h3 flex items-center gap-2" data-slot="attention-card-title">
                <Sparkles
                    v-if="ai"
                    class="size-4 shrink-0 text-highlight-ai"
                    aria-hidden="true"
                    data-slot="attention-card-icon"
                />
                {{ title }}
            </p>
            <p v-if="description" class="caption text-secondary mt-1" data-slot="attention-card-description">
                {{ description }}
            </p>
        </div>
        <UiButton
            variant="secondary"
            size="sm"
            :as="to ? NuxtLink : 'button'"
            :to="to"
            data-slot="attention-card-action"
            @click="emit('action')"
        >
            {{ actionLabel }}
        </UiButton>
    </UiCard>
</template>
