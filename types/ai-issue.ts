import { z } from 'zod'
import { IdSchema, IsoDateTimeSchema } from './shared'

export const AiIssueFieldSchema = z.enum([
    'title',
    'startDate',
    'endDate',
    'image',
    'headline',
    'days',
    'times',
    'supportingLine',
    'signUpUrl',
    'tag',
    'when',
    'qrLabel',
])

export const AiIssueSchema = z.object({
    id: IdSchema,
    flyerId: IdSchema,
    slideId: IdSchema.nullable(),
    field: AiIssueFieldSchema,
    message: z.string().trim().min(1),
    resolved: z.boolean(),
    createdAt: IsoDateTimeSchema,
})

export type AiIssueField = z.infer<typeof AiIssueFieldSchema>
export type AiIssue = z.infer<typeof AiIssueSchema>
