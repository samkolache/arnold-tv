import type { H3Event } from 'h3'
import type { MultiPartData } from 'h3'

export const BUCKETS = {
    flyers: {
        maxBytes: 10 * 1024 * 1024,
        types: { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' } as Record<string, string>,
    },
    logos: {
        maxBytes: 2 * 1024 * 1024,
        types: { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' } as Record<string, string>,
    },
}

export type Bucket = keyof typeof BUCKETS

export function isBucket(value: string): value is Bucket {
    return value in BUCKETS
}

export function assertUploadable(bucket: Bucket, file: MultiPartData) {
    const { maxBytes, types } = BUCKETS[bucket]
    const extension = file.type ? types[file.type] : undefined

    if (!extension) {
        throw createError({ statusCode: 415, statusMessage: `Unsupported file type for ${bucket}` })
    }
    if (file.data.length > maxBytes) {
        throw createError({ statusCode: 413, statusMessage: `File exceeds ${maxBytes / 1024 / 1024} MB` })
    }

    return extension
}

export async function uploadToBucket(event: H3Event, organizationId: string, bucket: Bucket, file: MultiPartData) {
    const extension = assertUploadable(bucket, file)
    const path = `${organizationId}/${crypto.randomUUID()}.${extension}`
    const storage = useSupabaseAdmin(event).storage.from(bucket)

    const { error } = await storage.upload(path, file.data, { contentType: file.type, upsert: false })
    if (error) {
        console.error('[supabase storage]', error)
        throw createError({ statusCode: 502, statusMessage: 'Upload failed' })
    }

    return { bucket, path, url: storage.getPublicUrl(path).data.publicUrl }
}
