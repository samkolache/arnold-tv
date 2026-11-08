import { z } from 'zod'
import { FlyerInputSchema, FlyerPatchSchema, IdSchema } from '~/types'

const ParamsSchema = z.object({ id: IdSchema })

export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)
    const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)
    const patch = await readValidatedBody(event, FlyerPatchSchema.parse)
    const supabase = useSupabaseAdmin(event)

    const existing = toFlyer(await requireFlyer(event, organization.id, id))

    const merged = FlyerInputSchema.safeParse({ ...existing, ...patch })
    if (!merged.success) {
        throw createError({ statusCode: 400, statusMessage: 'Validation Error', data: merged.error.issues })
    }

    const { slides, ...fields } = patch

    if (Object.keys(fields).length > 0) {
        const { error } = await supabase
            .from('flyers')
            .update(toFlyerFieldsRow(fields))
            .eq('id', id)

        if (error) throwDbError(error)
    }

    if (slides) {
        const existingIds = new Set(existing.slides.map((slide) => slide.id))
        const keptIds = new Set(slides.flatMap((slide) => (slide.id ? [slide.id] : [])))

        const foreignId = [...keptIds].find((slideId) => !existingIds.has(slideId))
        if (foreignId) {
            throw createError({ statusCode: 400, statusMessage: `Slide ${foreignId} does not belong to this flyer` })
        }

        const removedIds = [...existingIds].filter((slideId) => !keptIds.has(slideId))
        if (removedIds.length > 0) {
            const { error } = await supabase.from('slides').delete().in('id', removedIds)
            if (error) throwDbError(error)
        }

        if (slides.length > 0) {
            const { error } = await supabase.from('slides').upsert(toSlideRows(id, slides), { onConflict: 'id' })
            if (error) throwDbError(error)
        }
    }

    return toFlyer(await requireFlyer(event, organization.id, id))
})
