import type { Flyer, FlyerPreview } from '~/types/flyer'
import type { Timezone } from '~/types/shared'
import { getFlyerStatus } from './flyerStatus'
import { formatShortDate } from './flyerDisplay'

export const SECONDS_PER_SLIDE = 10

export interface RotationPosition {
    activeIndex: number
    progress: number
    secondsUntilNext: number
    loopSeconds: number
}

export function buildRotation(flyers: Flyer[], timezone: Timezone, now: Date): FlyerPreview[] {
    const live = flyers.filter((flyer) => flyer.slides.length > 0 && getFlyerStatus(flyer, timezone, now) === 'live')

    const events = live
        .filter((flyer) => flyer.type === 'one_time')
        .map((flyer) => ({
            id: flyer.id,
            title: flyer.title,
            meta: flyer.endDate ? `comes off after ${formatShortDate(flyer.endDate)}` : 'one-time event',
            image: flyer.image,
            slides: flyer.slides.length,
        }))

    const weekly = live
        .filter((flyer) => flyer.type === 'weekly')
        .flatMap((flyer) =>
            flyer.slides.map((slide) => ({
                id: slide.id,
                title: slide.headline,
                meta: `${flyer.title} · weekly`,
                image: flyer.image,
            })),
        )

    return [...events, ...weekly]
}

export function getRotationPosition(items: FlyerPreview[], nowMs: number): RotationPosition {
    const durations = items.map((item) => (item.slides ?? 1) * SECONDS_PER_SLIDE)
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
