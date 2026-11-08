import { z } from 'zod'

export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)
    const parts = await readMultipartFormData(event)
    const file = parts?.find((part) => part.name === 'file' && part.filename)

    if (!file) {
        throw createError({ statusCode: 400, statusMessage: 'Missing file' })
    }

    assertUploadable('flyers', file)

    const [upload, image, scannedQr] = await Promise.all([
        uploadToBucket(event, organization.id, 'flyers', file),
        toClaudeImage(file.data).catch(() => {
            throw createError({ statusCode: 422, statusMessage: FLYER_READ_FAILED })
        }),
        readQrCode(file.data).catch(() => null),
    ])

    const qrUrl = scannedQr && z.url().safeParse(scannedQr).success ? scannedQr : null

    return streamFlyerDraft(event, {
        organization,
        image,
        imageUrl: upload.url,
        qrUrl,
        request: 'Read this flyer.',
    })
})
