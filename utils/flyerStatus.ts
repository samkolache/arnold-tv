import { formatInTimeZone } from 'date-fns-tz'
import type { Flyer, FlyerStatus } from '~/types/flyer'
import type { Timezone } from '~/types/shared'

export function getFlyerStatus(
    flyer: Pick<Flyer, 'startDate' | 'endDate' | 'paused'>,
    timezone: Timezone,
    now: Date = new Date(),
): FlyerStatus {
    const today = formatInTimeZone(now, timezone, 'yyyy-MM-dd')

    if (flyer.endDate !== null && today > flyer.endDate) return 'ended'
    if (flyer.paused) return 'paused'
    if (today < flyer.startDate) return 'scheduled'
    return 'live'
}
