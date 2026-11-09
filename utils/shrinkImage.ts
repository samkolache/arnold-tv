const TARGET_BYTES = 3.5 * 1024 * 1024
const MAX_EDGE = 2400
const QUALITIES = [0.88, 0.78, 0.68]
const EDGE_STEP = 0.75

function toBlob(canvas: HTMLCanvasElement, quality: number) {
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

export async function shrinkImage(file: File): Promise<File> {
    if (file.size <= TARGET_BYTES) return file

    let bitmap: ImageBitmap
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
        return file
    }

    let edge = MAX_EDGE
    let smallest: Blob | null = null

    for (let attempt = 0; attempt < 4; attempt++) {
        const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bitmap.width * scale)
        canvas.height = Math.round(bitmap.height * scale)

        const context = canvas.getContext('2d')
        if (!context) break
        context.fillStyle = '#fff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

        for (const quality of QUALITIES) {
            const blob = await toBlob(canvas, quality)
            if (!blob) continue
            if (!smallest || blob.size < smallest.size) smallest = blob
            if (blob.size <= TARGET_BYTES) {
                bitmap.close()
                return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
            }
        }

        edge = Math.round(edge * EDGE_STEP)
    }

    bitmap.close()
    if (smallest && smallest.size < file.size) {
        return new File([smallest], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
    }
    return file
}
