import { z } from 'zod'
import { BrandSchema } from '~/types'
import { ensureBrandContrast, passesBrandContrast } from '~/utils/contrast'

const SYSTEM_PROMPT = `You design color palettes for a gym's TV screen, using the gym's logo as the brand source.
The TV shows class schedules on a dark background and is read from 15 feet away.

Return hex colors (#RRGGBB):
- background: a dark color taken from the brand, never a bright one.
- accent: a bright brand color used for class times. It must stand out strongly on the background.
- tag: a brand color for small tag pills (like "NEW" or "FREE"). It must differ clearly from the accent.
- stripe: 3 or 4 brand colors for a decorative stripe along the edge of the screen.
- text: a light color for headlines and body text, near white, optionally tinted toward the brand.

If the logo has only one or two colors, build the rest from tints and shades of those colors.`

const BrandFormatSchema = z.object({
    background: z.string().describe('Dark background, #RRGGBB'),
    accent: z.string().describe('Bright accent for times, #RRGGBB'),
    tag: z.string().describe('Tag pill color, #RRGGBB'),
    stripe: z.array(z.string()).describe('3 or 4 brand colors, #RRGGBB'),
    text: z.string().describe('Light text color, #RRGGBB'),
})

const ReachableBrandSchema = BrandSchema.refine((brand) => passesBrandContrast(brand, '#000000'), {
    message: 'text needs 4.5:1 and accent needs 3:1 contrast even against black. Make text lighter and the accent brighter.',
})

export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)

    if (!organization.logo) {
        throw createError({ statusCode: 400, statusMessage: 'Upload a logo before generating a brand palette' })
    }

    const logo = await $fetch<ArrayBuffer>(organization.logo, { responseType: 'arrayBuffer' }).catch(() => {
        throw createError({ statusCode: 502, statusMessage: "Couldn't download the logo" })
    })

    const palette = await askClaudeForJson({
        system: SYSTEM_PROMPT,
        content: [
            await toClaudeImage(Buffer.from(logo)),
            { type: 'text', text: `This is the logo for ${organization.name}. Create the TV palette.` },
        ],
        format: BrandFormatSchema,
        schema: ReachableBrandSchema,
    })

    if (!palette) {
        throw createError({ statusCode: 422, statusMessage: "Couldn't create a palette from this logo" })
    }

    const brand = ensureBrandContrast(palette)

    const { error } = await useSupabaseAdmin(event)
        .from('organizations')
        .update({ brand })
        .eq('id', organization.id)

    if (error) throwDbError(error)

    return brand
})
