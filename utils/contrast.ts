import type { Brand, HexColor } from '~/types/brand'

export const MIN_TEXT_CONTRAST = 4.5
export const MIN_ACCENT_CONTRAST = 3

function hexToRgb(hex: HexColor): [number, number, number] {
    const value = Number.parseInt(hex.slice(1), 16)
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function rgbToHex(rgb: [number, number, number]): HexColor {
    return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

function linearize(channel: number) {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: HexColor) {
    const [r, g, b] = hexToRgb(hex).map(linearize) as [number, number, number]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: HexColor, b: HexColor) {
    const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number]
    return (lighter + 0.05) / (darker + 0.05)
}

export function darken(hex: HexColor, amount: number): HexColor {
    const [r, g, b] = hexToRgb(hex)
    const keep = 1 - Math.min(Math.max(amount, 0), 1)
    return rgbToHex([r * keep, g * keep, b * keep])
}

export function passesBrandContrast(brand: Pick<Brand, 'text' | 'accent'>, background: HexColor) {
    return (
        contrastRatio(brand.text, background) >= MIN_TEXT_CONTRAST
        && contrastRatio(brand.accent, background) >= MIN_ACCENT_CONTRAST
    )
}

export function ensureBrandContrast(brand: Brand): Brand {
    let amount = 0
    let background = brand.background.toUpperCase()

    while (!passesBrandContrast(brand, background) && amount < 1) {
        amount = Math.min(1, amount + 0.02)
        background = darken(brand.background, amount)
    }

    return { ...brand, background }
}

export function brandCssVariables(brand: Brand | null) {
    if (!brand) return {}

    return {
        '--tv-background': brand.background,
        '--tv-accent': brand.accent,
        '--tv-tag': brand.tag,
        '--tv-text': brand.text,
        ...Object.fromEntries(brand.stripe.map((color, index) => [`--tv-stripe-${index + 1}`, color])),
    }
}

export function colorDistance(a: HexColor, b: HexColor) {
    const [ar, ag, ab] = hexToRgb(a)
    const [br, bg, bb] = hexToRgb(b)
    return Math.hypot(ar - br, ag - bg, ab - bb)
}

export function closestColor(target: HexColor, palette: HexColor[]) {
    if (!palette.length) return target
    return palette.reduce((best, color) => (colorDistance(color, target) < colorDistance(best, target) ? color : best))
}

export function mostReadableOn(background: HexColor, options: HexColor[]) {
    return options.reduce((best, color) => (contrastRatio(color, background) > contrastRatio(best, background) ? color : best))
}
