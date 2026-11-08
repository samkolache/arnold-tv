import { z } from 'zod'
import { FlyerDraftSchema } from '~/types'

const BodySchema = z.object({
    draft: FlyerDraftSchema,
    feedback: z.string().trim().min(1, 'Say what to change').max(500),
    slideIndex: z.int().nonnegative(),
    description: z.string().trim().max(2000).nullable().default(null),
})

export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)
    const { draft, feedback, slideIndex, description } = await readValidatedBody(event, BodySchema.parse)

    if (!draft.flyer.image && !description) {
        throw createError({ statusCode: 400, statusMessage: 'This draft has no flyer image or description' })
    }

    const image = draft.flyer.image
        ? await toClaudeImage(await downloadFlyerImage(event, organization.id, draft.flyer.image)).catch(() => {
            throw createError({ statusCode: 422, statusMessage: FLYER_READ_FAILED })
        })
        : null

    const slide = draft.flyer.slides[slideIndex]
    const looking = slide ? ` They were looking at slide ${slideIndex} ("${slide.headline}") when they wrote it.` : ''

    const request = [
        ...(description ? [describedFlyerRequest(description)] : []),
        'You already made a draft from this. This is the draft you made:',
        JSON.stringify(toClaudeDraft(draft), null, 2),
        `Staff feedback on that draft:${looking}`,
        `"""${feedback}"""`,
        'Make a new draft that fixes what they asked. Keep everything they didn\'t mention the same. The rules still apply, and never invent information that isn\'t on the flyer.',
    ].join('\n\n')

    return streamFlyerDraft(event, {
        organization,
        image,
        imageUrl: draft.flyer.image,
        qrUrl: draft.qrUrl,
        request,
    })
})
