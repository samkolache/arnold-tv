<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    label: string
    stat: string | number
    caption?: string
}

const props = defineProps<Props>()

const displayStat = computed(() =>
    typeof props.stat === 'number' ? props.stat.toLocaleString() : props.stat,
)
</script>

<template>
    <UiCard
        padding="md"
        data-slot="stat-card"
        class="min-w-0"
    >
        <p class="label-micro text-secondary mb-2" data-slot="stat-card-label">
            {{ label }}
        </p>
        <p
            class="heading-stat tabular-nums truncate mb-1"
            :title="displayStat"
            data-slot="stat-card-stat"
        >
            {{ displayStat }}
        </p>
        <p v-if="caption" class="caption text-secondary" data-slot="stat-card-caption">
            {{ caption }}
        </p>
    </UiCard>
</template>
