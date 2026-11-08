import { format, parseISO } from 'date-fns'
import type { Flyer, FlyerPreview, FlyerStatus } from '~/types/flyer'

export function formatShortDate(date: string) {
    return format(parseISO(date), 'MMM d')
}

export function formatDayDate(date: string) {
    return format(parseISO(date), 'EEE, MMM d')
}

export function describeFlyerType(flyer: Pick<Flyer, 'type'>) {
    return flyer.type === 'weekly' ? 'repeats weekly' : 'one-time event'
}

export function describeFlyerStatus(flyer: Pick<Flyer, 'startDate' | 'endDate'>, status: FlyerStatus) {
    switch (status) {
        case 'live':
            return flyer.endDate ? `Comes off after ${formatShortDate(flyer.endDate)}` : 'Plays until you remove it'
        case 'scheduled':
            return flyer.endDate
                ? `Starts ${formatDayDate(flyer.startDate)} · off after ${formatShortDate(flyer.endDate)}`
                : `Starts ${formatDayDate(flyer.startDate)}`
        case 'paused':
            return 'Paused · not on the TV'
        case 'ended':
            return `Ended ${formatShortDate(flyer.endDate ?? flyer.startDate)}`
    }
}

export function toFlyerPreview(flyer: Flyer): FlyerPreview {
    return {
        id: flyer.id,
        title: flyer.title,
        meta: describeFlyerType(flyer),
        image: flyer.image,
        slides: flyer.slides.length,
    }
}
