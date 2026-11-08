import type { Flyer, FlyerPreview } from '~/types/flyer'
import { SLIDE_SECONDS, type Slide } from '~/types/slide'
import type { Timezone } from '~/types/shared'
import { getFlyerStatus } from './flyerStatus'
import { formatShortDate } from './flyerDisplay'

export const SECONDS_PER_SLIDE = SLIDE_SECONDS.default

export interface RotationPosition {
    activeIndex: number
    progress: number
    secondsUntilNext: number
    loopSeconds: number
}

export interface RotationSlide {
    id: string
    flyerId: string
    slide: Slide
    seconds: number
}

function liveFlyersInOrder(flyers: Flyer[], timezone: Timezone, now: Date) {
    const live = flyers.filter((flyer) => flyer.slides.length > 0 && getFlyerStatus(flyer, timezone, now) === 'live')
    return {
        events: live.filter((flyer) => flyer.type === 'one_time'),
        weekly: live.filter((flyer) => flyer.type === 'weekly'),
    }
}

export function totalSeconds(slides: Pick<Slide, 'durationSeconds'>[]) {
    return slides.reduce((total, slide) => total + slide.durationSeconds, 0)
}

export function buildSlideRotation(flyers: Flyer[], timezone: Timezone, now: Date): RotationSlide[] {
    const { events, weekly } = liveFlyersInOrder(flyers, timezone, now)
    return [...events, ...weekly].flatMap((flyer) =>
        flyer.slides.map((slide) => ({ id: slide.id, flyerId: flyer.id, slide, seconds: slide.durationSeconds })),
    )
}

export function buildRotation(flyers: Flyer[], timezone: Timezone, now: Date): FlyerPreview[] {
    const { events: eventFlyers, weekly: weeklyFlyers } = liveFlyersInOrder(flyers, timezone, now)

    const events = eventFlyers
        .map((flyer) => ({
            id: flyer.id,
            title: flyer.title,
            meta: flyer.endDate ? `comes off after ${formatShortDate(flyer.endDate)}` : 'one-time event',
            image: flyer.image,
            slides: flyer.slides.length,
            seconds: totalSeconds(flyer.slides),
        }))

    const weekly = weeklyFlyers
        .flatMap((flyer) =>
            flyer.slides.map((slide) => ({
                id: slide.id,
                title: slide.headline,
                meta: `${flyer.title} · weekly`,
                image: flyer.image,
                seconds: slide.durationSeconds,
            })),
        )

    return [...events, ...weekly]
}

export function getRotationPosition(items: { seconds?: number }[], nowMs: number): RotationPosition {
    const durations = items.map((item) => item.seconds ?? SECONDS_PER_SLIDE)
    const loopSeconds = durations.reduce((total, seconds) => total + seconds, 0)

    if (loopSeconds === 0) return { activeIndex: 0, progress: 0, secondsUntilNext: 0, loopSeconds }

    let elapsed = (nowMs / 1000) % loopSeconds

    for (const [index, duration] of durations.entries()) {
        if (elapsed < duration) {
            return {
                activeIndex: index,
                progress: (elapsed / duration) * 100,
                secondsUntilNext: Math.ceil(duration - elapsed),
                loopSeconds,
            }
        }
        elapsed -= duration
    }

    return { activeIndex: 0, progress: 0, secondsUntilNext: 0, loopSeconds }
}
