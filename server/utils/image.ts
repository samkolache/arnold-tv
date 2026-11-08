import sharp from 'sharp'
import jsQR from 'jsqr'

const CLAUDE_MAX_EDGE = 1568
const QR_MAX_EDGE = 2000

export async function toClaudeImage(data: Buffer) {
    const png = await sharp(data, { density: 300 })
        .rotate()
        .resize({ width: CLAUDE_MAX_EDGE, height: CLAUDE_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer()

    return {
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: 'image/png' as const, data: png.toString('base64') },
    }
}

export async function readQrCode(data: Buffer): Promise<string | null> {
    const { data: pixels, info } = await sharp(data)
        .rotate()
        .resize({ width: QR_MAX_EDGE, height: QR_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })

    const code = jsQR(new Uint8ClampedArray(pixels.buffer, pixels.byteOffset, pixels.length), info.width, info.height)
    return code?.data.trim() || null
}
