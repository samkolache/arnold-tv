import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

export const SESSION_COOKIE = 'arnold_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30

export function matches(received: string, expected: string) {
    const a = Buffer.from(received)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
}

export function authConfig(event: H3Event) {
    const { basicAuthUser, basicAuthPassword } = useRuntimeConfig(event)
    if (!basicAuthUser || !basicAuthPassword) return null
    return { user: basicAuthUser, password: basicAuthPassword }
}

export function sessionToken(user: string, password: string) {
    return createHmac('sha256', password).update(`session:${user}`).digest('hex')
}

export function hasValidSession(event: H3Event) {
    const config = authConfig(event)
    if (!config) return true
    const token = getCookie(event, SESSION_COOKIE)
    return !!token && matches(token, sessionToken(config.user, config.password))
}
