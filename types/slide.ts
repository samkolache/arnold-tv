import { z } from 'zod'
import { DayOfWeekSchema, IdSchema, TimeSchema } from './shared'

export const ExtraTimesSchema = z.partialRecord(DayOfWeekSchema, z.array(TimeSchema))

export const SlideSchema = z.object({
    id: IdSchema,
    tag: z.string().trim().min(1).nullable(),
    headline: z.string().trim().min(1),
    days: z.array(DayOfWeekSchema),
    times: z.array(TimeSchema),
    extraTimes: ExtraTimesSchema,
    when: z.string().trim().min(1).nullable(),
    supportingLine: z.string().trim().nullable(),
    signUpUrl: z.url().nullable(),
    qrLabel: z.string().trim().min(1).nullable(),
})

export const SlideInputSchema = SlideSchema.extend({
    id: IdSchema.optional(),
    tag: SlideSchema.shape.tag.default(null),
    extraTimes: ExtraTimesSchema.default({}),
    when: SlideSchema.shape.when.default(null),
    supportingLine: SlideSchema.shape.supportingLine.default(null),
    signUpUrl: SlideSchema.shape.signUpUrl.default(null),
    qrLabel: SlideSchema.shape.qrLabel.default(null),
})

export type ExtraTimes = z.infer<typeof ExtraTimesSchema>
export type Slide = z.infer<typeof SlideSchema>
export type SlideInput = z.infer<typeof SlideInputSchema>
