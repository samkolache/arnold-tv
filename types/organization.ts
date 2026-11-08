import { z } from 'zod'
import { DayOfWeekSchema, IdSchema, TimeSchema, TimezoneSchema } from './shared'

export const OpeningHoursSchema = z
    .object({
        open: TimeSchema,
        close: TimeSchema,
    })
    .refine((hours) => hours.open < hours.close, {
        message: 'Closing time must be after opening time',
        path: ['close'],
    })

export const GymHoursSchema = z.record(DayOfWeekSchema, OpeningHoursSchema.nullable())

export const OrganizationSchema = z.object({
    id: IdSchema,
    name: z.string().trim().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and dashes only'),
    logo: z.url().nullable(),
    timezone: TimezoneSchema,
    gymHours: GymHoursSchema,
})

export type OpeningHours = z.infer<typeof OpeningHoursSchema>
export type GymHours = z.infer<typeof GymHoursSchema>
export type Organization = z.infer<typeof OrganizationSchema>
