import { z } from 'zod'
import { IdSchema } from './shared'

export const TopSlideSchema = z.object({
    slideId: IdSchema,
    flyerId: IdSchema,
    headline: z.string(),
    scans: z.int().nonnegative(),
})

export const WeekTotalsSchema = z.object({
    scans: z.int().nonnegative(),
    signUps: z.int().nonnegative(),
    topSlide: TopSlideSchema.nullable(),
})

export const WeeklyStatsSchema = WeekTotalsSchema.extend({
    organizationId: IdSchema,
    lastWeek: WeekTotalsSchema,
})

export type TopSlide = z.infer<typeof TopSlideSchema>
export type WeekTotals = z.infer<typeof WeekTotalsSchema>
export type WeeklyStats = z.infer<typeof WeeklyStatsSchema>
