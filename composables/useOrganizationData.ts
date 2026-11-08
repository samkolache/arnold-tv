import type { AiIssue, Flyer, Organization, WeeklyStats } from '~/types'

function useApiPath(path = '') {
    const slug = useRuntimeConfig().public.organizationSlug
    if (!slug) {
        throw createError({ statusCode: 500, statusMessage: 'Set NUXT_PUBLIC_ORGANIZATION_SLUG in .env' })
    }
    return `/api/organizations/${slug}${path}`
}

export function useOrganization() {
    return useFetch<Organization>(useApiPath(), { key: 'organization' })
}

export function useFlyers() {
    return useFetch<Flyer[]>(useApiPath('/flyers'), { key: 'flyers', default: () => [] })
}

export function useWeeklyStats() {
    return useFetch<WeeklyStats>(useApiPath('/stats'), { key: 'stats' })
}

export function useAiIssues() {
    return useFetch<AiIssue[]>(useApiPath('/ai-issues'), { key: 'ai-issues', default: () => [] })
}

export function useFlyerActions() {
    const flyersPath = useApiPath('/flyers')

    async function setPaused(flyer: Flyer, paused: boolean) {
        await $fetch<Flyer>(`${flyersPath}/${flyer.id}`, { method: 'PATCH', body: { paused } })
        await refreshNuxtData('flyers')
    }

    async function duplicate(flyer: Flyer) {
        await $fetch<Flyer>(flyersPath, {
            method: 'POST',
            body: {
                title: `${flyer.title} (copy)`,
                type: flyer.type,
                startDate: flyer.startDate,
                endDate: flyer.endDate,
                paused: true,
                image: flyer.image,
                slides: flyer.slides.map(({ id, ...slide }) => slide),
            },
        })
        await refreshNuxtData('flyers')
    }

    return { setPaused, duplicate }
}
