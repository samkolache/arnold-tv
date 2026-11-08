import type { H3Event } from 'h3'
import type { PostgrestError } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { FlyerWithSlidesRow, OrganizationRow } from './rows'

const POSTGRES_ERROR_STATUS: Record<string, number> = {
    '22P02': 400,
    '23502': 400,
    '23503': 400,
    '23514': 400,
    '23505': 409,
}

export function useSupabaseAdmin(event: H3Event) {
    return serverSupabaseServiceRole<any>(event)
}

export function throwDbError(error: PostgrestError): never {
    const statusCode = POSTGRES_ERROR_STATUS[error.code] ?? 500

    if (statusCode === 500) {
        console.error('[supabase]', error)
        throw createError({ statusCode, statusMessage: 'Database error' })
    }

    throw createError({ statusCode, statusMessage: error.message })
}

export async function requireOrganization(event: H3Event): Promise<OrganizationRow> {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing organization slug' })

    const { data, error } = await useSupabaseAdmin(event)
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .maybeSingle<OrganizationRow>()

    if (error) throwDbError(error)
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Organization not found' })

    return data
}

export const FLYER_WITH_SLIDES = '*, slides(*, qr_scans(count))'

export async function requireFlyer(event: H3Event, organizationId: string, flyerId: string): Promise<FlyerWithSlidesRow> {
    const { data, error } = await useSupabaseAdmin(event)
        .from('flyers')
        .select(FLYER_WITH_SLIDES)
        .eq('organization_id', organizationId)
        .eq('id', flyerId)
        .maybeSingle<FlyerWithSlidesRow>()

    if (error) throwDbError(error)
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Flyer not found' })

    return data
}
