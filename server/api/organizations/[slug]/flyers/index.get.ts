import type { FlyerWithSlidesRow } from '~~/server/utils/rows'

export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)

    const { data, error } = await useSupabaseAdmin(event)
        .from('flyers')
        .select(FLYER_WITH_SLIDES)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .returns<FlyerWithSlidesRow[]>()

    if (error) throwDbError(error)

    return data.map(toFlyer)
})
