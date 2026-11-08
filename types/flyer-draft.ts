import { z } from 'zod'
import { AiIssueFieldSchema } from './ai-issue'
import { FlyerInputSchema } from './flyer'
import type { SlideKind } from './slide'

export const FlyerDraftIssueSchema = z.object({
    slideIndex: z.int().nonnegative().nullable(),
    field: AiIssueFieldSchema,
    message: z.string().trim().min(1),
})

export const FlyerDraftChangeSchema = z.object({
    slideIndex: z.int().nonnegative().nullable(),
    message: z.string().trim().min(1),
})

export const FlyerDraftSchema = z.object({
    flyer: FlyerInputSchema,
    qrUrl: z.url().nullable(),
    issues: z.array(FlyerDraftIssueSchema),
    changes: z.array(FlyerDraftChangeSchema),
})

export type FlyerDraftIssue = z.infer<typeof FlyerDraftIssueSchema>
export type FlyerDraftChange = z.infer<typeof FlyerDraftChangeSchema>
export type FlyerDraft = z.infer<typeof FlyerDraftSchema>

export type SlideKindCounts = Partial<Record<SlideKind, number>>

export type FlyerReadStage = 'read' | 'slides' | 'check'

export type FlyerReadEvent =
    | { type: 'stage', stage: FlyerReadStage }
    | { type: 'found', kinds: SlideKindCounts }
    | { type: 'retry' }
    | { type: 'draft', draft: FlyerDraft }
    | { type: 'error', message: string }
