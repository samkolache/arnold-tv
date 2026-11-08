const PUBLIC_PATHS = ['/login', '/api/auth/login', '/favicon.ico']
const PUBLIC_PREFIXES = ['/_nuxt/', '/_fonts/', '/__nuxt', '/api/_nuxt_icon']

export default defineEventHandler((event) => {
    if (!authConfig(event)) return

    const path = getRequestURL(event).pathname
    if (PUBLIC_PATHS.includes(path) || PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))) return
    if (hasValidSession(event)) return

    if (path.startsWith('/api/')) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const target = path === '/' ? '/login' : `/login?redirect=${encodeURIComponent(path)}`
    return sendRedirect(event, target, 302)
})
