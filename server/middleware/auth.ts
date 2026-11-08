import { timingSafeEqual } from 'node:crypto'

function matches(received: string, expected: string) {
    const a = Buffer.from(received)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
}

export default defineEventHandler((event) => {
    const { basicAuthUser, basicAuthPassword } = useRuntimeConfig(event)
    if (!basicAuthUser || !basicAuthPassword) return

    const header = getHeader(event, 'authorization') ?? ''
    const [scheme, encoded = ''] = header.split(' ')
    const decoded = scheme?.toLowerCase() === 'basic' ? Buffer.from(encoded, 'base64').toString() : ''
    const separator = decoded.indexOf(':')
    const user = separator === -1 ? '' : decoded.slice(0, separator)
    const password = separator === -1 ? '' : decoded.slice(separator + 1)

    if (matches(user, basicAuthUser) && matches(password, basicAuthPassword)) return

    setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="Arnold TV", charset="UTF-8"')
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
})
