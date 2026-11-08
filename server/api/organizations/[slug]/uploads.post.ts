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

    const upload = await uploadToBucket(event, organization.id, bucket, file)

    setResponseStatus(event, 201)
    return upload
})
