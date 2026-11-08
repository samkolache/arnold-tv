
const BUCKETS = {
    flyers: {
        maxBytes: 10 * 1024 * 1024,
        types: { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' },
    },
    logos: {
        maxBytes: 2 * 1024 * 1024,
        types: { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' },
    },
} satisfies Record<string, { maxBytes: number, types: Record<string, string> }>

type Bucket = keyof typeof BUCKETS

function isBucket(value: string): value is Bucket {
    return value in BUCKETS
}

export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)
    const parts = await readMultipartFormData(event)

    const bucket = parts?.find((part) => part.name === 'bucket')?.data.toString()
    const file = parts?.find((part) => part.name === 'file' && part.filename)

    if (!bucket || !isBucket(bucket)) {
        throw createError({ statusCode: 400, statusMessage: `bucket must be one of: ${Object.keys(BUCKETS).join(', ')}` })
    }
    if (!file) {
        throw createError({ statusCode: 400, statusMessage: 'Missing file' })
    }

    const { maxBytes, types } = BUCKETS[bucket]
    const extension = file.type ? (types as Record<string, string>)[file.type] : undefined

    if (!extension) {
        throw createError({ statusCode: 415, statusMessage: `Unsupported file type for ${bucket}` })
    }
    if (file.data.length > maxBytes) {
        throw createError({ statusCode: 413, statusMessage: `File exceeds ${maxBytes / 1024 / 1024} MB` })
    }

    const path = `${organization.id}/${crypto.randomUUID()}.${extension}`
    const storage = useSupabaseAdmin(event).storage.from(bucket)

    const { error } = await storage.upload(path, file.data, { contentType: file.type, upsert: false })
    if (error) {
        console.error('[supabase storage]', error)
        throw createError({ statusCode: 502, statusMessage: 'Upload failed' })
    }

    setResponseStatus(event, 201)
    return { bucket, path, url: storage.getPublicUrl(path).data.publicUrl }
})
