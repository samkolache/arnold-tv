import { subDays } from 'date-fns'
import type { WeeklyStats, WeekTotals } from '~/types'
import type { SlideActivityRow } from '~~/server/utils/rows'

function toWeekTotals(rows: SlideActivityRow[]): WeekTotals {
    const top = rows.reduce<SlideActivityRow | null>(
        (best, row) => (row.scans > (best?.scans ?? 0) ? row : best),
        null,
    )

    return {
        scans: rows.reduce((total, row) => total + row.scans, 0),
        signUps: rows.reduce((total, row) => total + row.sign_ups, 0),
        topSlide: top
            ? { slideId: top.slide_id, flyerId: top.flyer_id, headline: top.headline, scans: top.scans }
            : null,
    }
}

export default defineEventHandler(async (event): Promise<WeeklyStats> => {
    const organization = await requireOrganization(event)
    const supabase = useSupabaseAdmin(event)

    const now = new Date()
    const weekAgo = subDays(now, 7)
    const twoWeeksAgo = subDays(now, 14)

    const activity = async (since: Date, until: Date) => {
        const { data, error } = await supabase
            .rpc('slide_activity', {
                p_organization_id: organization.id,
                p_since: since.toISOString(),
                p_until: until.toISOString(),
            })

        if (error) throwDbError(error)
        return data as SlideActivityRow[]
    }

    const [thisWeek, lastWeek] = await Promise.all([activity(weekAgo, now), activity(twoWeeksAgo, weekAgo)])

    return {
        ...toWeekTotals(thisWeek),
        organizationId: organization.id,
        lastWeek: toWeekTotals(lastWeek),
    }
})
