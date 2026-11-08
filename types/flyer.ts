import { z } from 'zod'
import { IdSchema, IsoDateSchema } from './shared'
import { SlideSchema } from './slide'

export const FlyerTypeSchema = z.enum(['weekly', 'one_time'])

export const FlyerSchema = z
    .object({
        id: IdSchema,
        organizationId: IdSchema,
        title: z.string().trim().min(1),
        type: FlyerTypeSchema,
        startDate: IsoDateSchema,
        endDate: IsoDateSchema.nullable(),
        paused: z.boolean(),
        image: z.url(),
        slides: z.array(SlideSchema),
        qrScans: z.int().nonnegative(),
    })
    .refine((flyer) => flyer.type !== 'one_time' || flyer.endDate !== null, {
        message: 'One-time flyers need an end date',
        path: ['endDate'],
    })
    .refine((flyer) => flyer.endDate === null || flyer.endDate >= flyer.startDate, {
        message: 'End date must be on or after the start date',
        path: ['endDate'],
    })

export const FlyerStatusSchema = z.enum(['live', 'scheduled', 'paused', 'ended'])

export type FlyerType = z.infer<typeof FlyerTypeSchema>
export type Flyer = z.infer<typeof FlyerSchema>
export type FlyerStatus = z.infer<typeof FlyerStatusSchema>

export interface FlyerPreview {
    id: string
    title: string
    meta: string
    image: string
    slides?: number
}
