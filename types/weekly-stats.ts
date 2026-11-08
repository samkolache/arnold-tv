import { z } from 'zod'
import { IdSchema, IsoDateSchema } from './shared'

export const TopFlyerSchema = z.object({
    flyerId: IdSchema,
    title: z.string(),
    scans: z.int().nonnegative(),
})

export const WeekTotalsSchema = z.object({
    scans: z.int().nonnegative(),
    signUps: z.int().nonnegative(),
    topFlyer: TopFlyerSchema.nullable(),
})

export const WeeklyStatsSchema = WeekTotalsSchema.extend({
    organizationId: IdSchema,
    weekStart: IsoDateSchema,
    lastWeek: WeekTotalsSchema,
})

export type TopFlyer = z.infer<typeof TopFlyerSchema>
export type WeekTotals = z.infer<typeof WeekTotalsSchema>
export type WeeklyStats = z.infer<typeof WeeklyStatsSchema>
