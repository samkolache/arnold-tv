import { z } from 'zod'
import { IdSchema } from '~/types'

const ParamsSchema = z.object({ id: IdSchema })

export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)
    const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)

    await requireFlyer(event, organization.id, id)

    const { error } = await useSupabaseAdmin(event)
        .from('flyers')
        .delete()
        .eq('organization_id', organization.id)
        .eq('id', id)

    if (error) throwDbError(error)

    setResponseStatus(event, 204)
    return null
})
