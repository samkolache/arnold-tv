import type { AiIssueRow } from '~~/server/utils/rows'

export default defineEventHandler(async (event) => {
    const organization = await requireOrganization(event)

    const { data, error } = await useSupabaseAdmin(event)
        .from('ai_issues')
        .select('id, flyer_id, slide_id, field, message, resolved, created_at, flyers!inner(organization_id)')
        .eq('flyers.organization_id', organization.id)
        .eq('resolved', false)
        .order('created_at', { ascending: true })
        .returns<AiIssueRow[]>()

    if (error) throwDbError(error)

    return data.map(toAiIssue)
})
