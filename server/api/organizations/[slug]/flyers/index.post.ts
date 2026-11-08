import { FlyerInputSchema } from '~/types'

export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)
    const input = await readValidatedBody(event, FlyerInputSchema.parse)
    const supabase = useSupabaseAdmin(event)

    const { data: flyer, error: flyerError } = await supabase
        .from('flyers')
        .insert({ ...toFlyerFieldsRow(input), organization_id: organization.id })
        .select('id')
        .single<{ id: string }>()

    if (flyerError) throwDbError(flyerError)

    if (input.slides.length > 0) {
        const slides = input.slides.map((slide) => ({ ...slide, id: undefined }))
        const { error: slidesError } = await supabase.from('slides').insert(toSlideRows(flyer.id, slides))

        if (slidesError) {
            await supabase.from('flyers').delete().eq('id', flyer.id)
            throwDbError(slidesError)
        }
    }

    setResponseStatus(event, 201)
    return toFlyer(await requireFlyer(event, organization.id, flyer.id))
})
