<script setup lang="ts">
import { computed } from 'vue'
import type { Brand, DayOfWeek, HexColor, SlideInput, SlideKind } from '~/types'
import { brandCssVariables, closestColor, mostReadableOn } from '~/utils/contrast'

type TvSlideContent = Pick<SlideInput, 'kind' | 'tag' | 'headline' | 'days' | 'times' | 'when' | 'supportingLine' | 'signUpUrl' | 'qrLabel'>

interface SlideKindStyle {
    tagColor: HexColor
    defaultTag: string
    defaultQrLabel: string | null
}

interface Props {
    slide: TvSlideContent
    brand?: Brand | null
    logo?: string | null
    transitionKey?: string | null
}

const props = withDefaults(defineProps<Props>(), {
    brand: null,
    logo: null,
    transitionKey: null,
})

const SLIDE_KINDS: Record<SlideKind, SlideKindStyle> = {
    class: { tagColor: '#E5532D', defaultTag: 'FREE CLASS', defaultQrLabel: 'Scan to save your spot' },
    event: { tagColor: '#F6C324', defaultTag: 'EVENT', defaultQrLabel: 'Scan to RSVP' },
    hours: { tagColor: '#F28C28', defaultTag: 'HOURS', defaultQrLabel: null },
    closure: { tagColor: '#E5532D', defaultTag: 'HEADS UP', defaultQrLabel: null },
    new: { tagColor: '#F6C324', defaultTag: 'NEW', defaultQrLabel: 'Scan to learn more' },
    announcement: { tagColor: '#2FB5C0', defaultTag: 'NOTICE', defaultQrLabel: 'Scan for details' },
}

const TAG_TEXT_OPTIONS: HexColor[] = ['#FFF6E5', '#082A2D']

const DAY_LABELS: Record<DayOfWeek, string> = {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
}

function formatTime(time: string) {
    const [hours = 0, minutes = 0] = time.split(':').map(Number)
    const period = hours < 12 ? 'AM' : 'PM'
    const hour = hours % 12 || 12
    return minutes ? `${hour}:${String(minutes).padStart(2, '0')} ${period}` : `${hour} ${period}`
}

const kind = computed(() => SLIDE_KINDS[props.slide.kind] ?? SLIDE_KINDS.announcement)

const tagColor = computed(() => {
    const { brand } = props
    if (!brand) return kind.value.tagColor
    return closestColor(kind.value.tagColor, [brand.tag, brand.accent, ...brand.stripe])
})

const tag = computed(() => props.slide.tag ?? kind.value.defaultTag)

const qrLabel = computed(() => {
    if (!kind.value.defaultQrLabel || !props.slide.signUpUrl) return null
    return props.slide.qrLabel ?? kind.value.defaultQrLabel
})

const style = computed(() => brandCssVariables(props.brand))

const bodyStyle = computed(() => ({
    '--tv-tag': tagColor.value,
    '--tv-tag-text': mostReadableOn(tagColor.value, TAG_TEXT_OPTIONS),
}))

const SWAP_DURATION = { enter: 1000, leave: 400 }
const stripeCount = computed(() => props.brand?.stripe.length ?? 3)
const days = computed(() => props.slide.days?.map((day) => DAY_LABELS[day]).join(' · ') ?? '')
const times = computed(() => props.slide.times?.map(formatTime).join(' · ') ?? '')
const schedule = computed(() => [props.slide.when, days.value].filter(Boolean).join(' — '))
</script>

<template>
    <div
        data-slot="tv-slide"
        class="tv-slide relative aspect-video w-full overflow-hidden bg-[var(--tv-background)] text-[var(--tv-text)]"
        :style="style"
    >
        <img
            v-if="logo"
            :src="logo"
            alt=""
            data-slot="tv-slide-logo"
            class="absolute right-[4cqw] top-[4cqw] h-[7cqw] w-auto object-contain"
        >

        <Transition name="tv-swap" mode="out-in" :duration="SWAP_DURATION">
            <div
                :key="transitionKey ?? 'slide'"
                data-slot="tv-slide-body"
                class="flex h-full flex-col justify-center gap-[1.6cqw] px-[7cqw] pb-[3cqw]"
                :style="bodyStyle"
            >
                <span
                    data-slot="tv-slide-tag"
                    class="w-fit rounded-full bg-[var(--tv-tag)] px-[1.8cqw] py-[0.6cqw] font-display text-[2cqw] font-bold uppercase leading-none tracking-[0.12em] text-[var(--tv-tag-text)]"
                >
                    {{ tag }}
                </span>

                <h2 data-slot="tv-slide-headline" class="font-display text-[7.5cqw] font-bold leading-[1.05] tracking-[-0.02em]">
                    {{ slide.headline }}
                </h2>

                <p v-if="schedule" data-slot="tv-slide-schedule" class="font-display text-[3.4cqw] font-semibold leading-tight opacity-90">
                    {{ schedule }}
                </p>

                <p v-if="times" data-slot="tv-slide-times" class="font-display text-[5cqw] font-bold leading-tight text-[var(--tv-accent)]">
                    {{ times }}
                </p>

                <p v-if="slide.supportingLine" data-slot="tv-slide-supporting-line" class="font-sans text-[3cqw] leading-snug opacity-85">
                    {{ slide.supportingLine }}
                </p>

                <p v-if="qrLabel" data-slot="tv-slide-qr-label" class="font-sans text-[2.4cqw] font-semibold opacity-75">
                    {{ qrLabel }}
                </p>
            </div>
        </Transition>

        <div data-slot="tv-slide-stripe" class="absolute inset-x-0 bottom-0 flex h-[1.4cqw]">
            <span
                v-for="index in stripeCount"
                :key="index"
                data-slot="tv-slide-stripe-band"
                class="flex-1"
                :style="{ backgroundColor: `var(--tv-stripe-${index})` }"
            />
        </div>
    </div>
</template>

<style scoped>
.tv-slide {
    container-type: inline-size;
    --tv-background: rgb(var(--bg-inverse));
    --tv-text: rgb(var(--text-on-inverse));
    --tv-accent: rgb(var(--highlight-pop));
    --tv-stripe-1: rgb(var(--highlight-pop));
    --tv-stripe-2: rgb(var(--action-primary));
    --tv-stripe-3: rgb(var(--highlight-ai));
}
.tv-swap-leave-active {
    transition: opacity 400ms cubic-bezier(0.4, 0, 1, 1), transform 400ms cubic-bezier(0.4, 0, 1, 1);
}

.tv-swap-leave-to {
    opacity: 0;
    transform: translateY(-1.5cqw);
}

.tv-swap-enter-active > * {
    transition: opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.tv-swap-enter-active > :nth-child(2) { transition-delay: 80ms; }
.tv-swap-enter-active > :nth-child(3) { transition-delay: 160ms; }
.tv-swap-enter-active > :nth-child(4) { transition-delay: 240ms; }
.tv-swap-enter-active > :nth-child(5) { transition-delay: 320ms; }
.tv-swap-enter-active > :nth-child(6) { transition-delay: 400ms; }

.tv-swap-enter-from > * {
    opacity: 0;
    transform: translateY(2.5cqw);
}

@media (prefers-reduced-motion: reduce) {
    .tv-swap-leave-to,
    .tv-swap-enter-from > * {
        transform: none;
    }
}
</style>
