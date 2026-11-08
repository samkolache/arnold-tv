import { z } from 'zod'
import { DayOfWeekSchema, IdSchema, TimeSchema } from './shared'

export const SlideSchema = z.object({
    id: IdSchema,
    headline: z.string().trim().min(1),
    days: z.array(DayOfWeekSchema),
    times: z.array(TimeSchema),
    supportingLine: z.string().trim().nullable(),
    signUpUrl: z.url().nullable(),
})

export type Slide = z.infer<typeof SlideSchema>
