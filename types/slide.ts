import { z } from 'zod'
import { DayOfWeekSchema, IdSchema, TimeSchema } from './shared'

export const SLIDE_SECONDS = { min: 5, max: 60, default: 10 } as const

export const SlideDurationSchema = z.int().min(SLIDE_SECONDS.min).max(SLIDE_SECONDS.max)

export const SlideKindSchema = z.enum(['class', 'event', 'hours', 'closure', 'new', 'announcement'])

export const ExtraTimesSchema = z.partialRecord(DayOfWeekSchema, z.array(TimeSchema))

export const SlideSchema = z.object({
    id: IdSchema,
    kind: SlideKindSchema,
    tag: z.string().trim().min(1).nullable(),
    headline: z.string().trim().min(1),
    days: z.array(DayOfWeekSchema),
    times: z.array(TimeSchema),
    extraTimes: ExtraTimesSchema,
    when: z.string().trim().min(1).nullable(),
    supportingLine: z.string().trim().nullable(),
    signUpUrl: z.url().nullable(),
    qrLabel: z.string().trim().min(1).nullable(),
    durationSeconds: SlideDurationSchema,
})

export const SlideInputSchema = SlideSchema.extend({
    id: IdSchema.optional(),
    kind: SlideKindSchema.default('announcement'),
    tag: SlideSchema.shape.tag.default(null),
    extraTimes: ExtraTimesSchema.default({}),
    when: SlideSchema.shape.when.default(null),
    supportingLine: SlideSchema.shape.supportingLine.default(null),
    signUpUrl: SlideSchema.shape.signUpUrl.default(null),
    qrLabel: SlideSchema.shape.qrLabel.default(null),
    durationSeconds: SlideDurationSchema.default(SLIDE_SECONDS.default),
})

export type SlideKind = z.infer<typeof SlideKindSchema>
export type ExtraTimes = z.infer<typeof ExtraTimesSchema>
export type Slide = z.infer<typeof SlideSchema>
export type SlideInput = z.infer<typeof SlideInputSchema>
