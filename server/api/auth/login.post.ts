import { z } from 'zod'

const BodySchema = z.object({
    username: z.string(),
    password: z.string(),
})

export default defineEventHandler(async (event) => {
    const config = authConfig(event)
    if (!config) return { ok: true }

    const body = BodySchema.safeParse(await readBody(event))
    const valid = body.success
        && matches(body.data.username, config.user)
        && matches(body.data.password, config.password)

    if (!valid) throw createError({ statusCode: 401, statusMessage: 'Incorrect username or password' })

    setCookie(event, SESSION_COOKIE, sessionToken(config.user, config.password), {
        httpOnly: true,
        secure: !import.meta.dev,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
    })

    return { ok: true }
})
