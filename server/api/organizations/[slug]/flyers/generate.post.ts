import { z } from 'zod'

const BodySchema = z.object({
    description: z.string().trim().min(10, 'Tell AI a bit more about what to show').max(2000),
})

export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)
    const { description } = await readValidatedBody(event, BodySchema.parse)

    return streamFlyerDraft(event, {
        organization,
        image: null,
        imageUrl: null,
        qrUrl: null,
        request: describedFlyerRequest(description),
    })
})
