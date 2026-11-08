import { z } from 'zod'

export const IdSchema = z.uuid()

export const IsoDateSchema = z.iso.date()

export const IsoDateTimeSchema = z.iso.datetime({ offset: true })

export const TimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:mm')

export const DayOfWeekSchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])

export const TimezoneSchema = z.string().refine(
    (tz) => {
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: tz })
            return true
        } catch {
            return false
        }
    },
    'Unknown IANA timezone',
)

export type Id = z.infer<typeof IdSchema>
export type IsoDate = z.infer<typeof IsoDateSchema>
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>
export type Time = z.infer<typeof TimeSchema>
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>
export type Timezone = z.infer<typeof TimezoneSchema>
