import { z } from 'zod'

export const HexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex color like #1A2B3C')

export const BrandSchema = z.object({
    background: HexColorSchema,
    accent: HexColorSchema,
    tag: HexColorSchema,
    stripe: z.array(HexColorSchema).min(3).max(4),
    text: HexColorSchema,
})

export type HexColor = z.infer<typeof HexColorSchema>
export type Brand = z.infer<typeof BrandSchema>
