import { z } from 'zod'
import { IdSchema, IsoDateSchema } from './shared'
import { SlideInputSchema, SlideSchema } from './slide'

export const FlyerTypeSchema = z.enum(['weekly', 'one_time'])

type FlyerDates = {
    type: z.infer<typeof FlyerTypeSchema>
    startDate: string
    endDate: string | null
}

function checkFlyerDates(flyer: FlyerDates, ctx: z.RefinementCtx) {
    if (flyer.type === 'one_time' && flyer.endDate === null) {
        ctx.addIssue({ code: 'custom', message: 'One-time flyers need an end date', path: ['endDate'] })
    }
    if (flyer.endDate !== null && flyer.endDate < flyer.startDate) {
        ctx.addIssue({ code: 'custom', message: 'End date must be on or after the start date', path: ['endDate'] })
    }
}

const FlyerFieldsSchema = z.object({
    title: z.string().trim().min(1),
    type: FlyerTypeSchema,
    startDate: IsoDateSchema,
    endDate: IsoDateSchema.nullable(),
    paused: z.boolean(),
    image: z.url().nullable(),
})

export const FlyerSchema = FlyerFieldsSchema.extend({
    id: IdSchema,
    organizationId: IdSchema,
    slides: z.array(SlideSchema),
    qrScans: z.int().nonnegative(),
}).superRefine(checkFlyerDates)

const FlyerInputFieldsSchema = FlyerFieldsSchema.extend({
    slides: z.array(SlideInputSchema),
})

export const FlyerInputSchema = FlyerInputFieldsSchema.extend({
    endDate: IsoDateSchema.nullable().default(null),
    paused: z.boolean().default(false),
    image: FlyerFieldsSchema.shape.image.default(null),
}).superRefine(checkFlyerDates)

export const FlyerPatchSchema = FlyerInputFieldsSchema.partial()

export const FlyerStatusSchema = z.enum(['live', 'scheduled', 'paused', 'ended'])

export type FlyerType = z.infer<typeof FlyerTypeSchema>
export type Flyer = z.infer<typeof FlyerSchema>
export type FlyerInput = z.infer<typeof FlyerInputSchema>
export type FlyerPatch = z.infer<typeof FlyerPatchSchema>
export type FlyerStatus = z.infer<typeof FlyerStatusSchema>

export interface FlyerPreview {
    id: string
    title: string
    meta: string
    image: string | null
    slides?: number
    seconds?: number
}
