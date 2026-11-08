import type { AiIssue, Brand, Flyer, FlyerDraft, FlyerInput, FlyerPatch, FlyerReadEvent, Organization, WeeklyStats } from '~/types'

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

    async function create(input: FlyerInput) {
        const flyer = await $fetch<Flyer>(flyersPath, { method: 'POST', body: input })
        await refreshNuxtData('flyers')
        return flyer
    }

    async function update(flyer: Flyer, patch: FlyerPatch) {
        const updated = await $fetch<Flyer>(`${flyersPath}/${flyer.id}`, { method: 'PATCH', body: patch })
        await refreshNuxtData('flyers')
        return updated
    }

    async function remove(flyer: Flyer) {
        await $fetch(`${flyersPath}/${flyer.id}`, { method: 'DELETE' })
        await refreshNuxtData('flyers')
    }

    return { setPaused, duplicate, create, update, remove }
}

async function readDraftStream(request: Promise<Response>, onEvent: (event: FlyerReadEvent) => void) {
    const response = await request
    if (!response.ok || !response.body) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.statusMessage ?? "Couldn't read this flyer")
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
    let buffer = ''

    while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += value
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
            if (!line.trim()) continue
            const event = JSON.parse(line) as FlyerReadEvent
            if (event.type === 'error') throw new Error(event.message)
            onEvent(event)
            if (event.type === 'draft') return event.draft
        }
    }

    throw new Error("Couldn't read this flyer")
}

export function useFlyerReader() {
    const parsePath = useApiPath('/flyers/parse')
    const regeneratePath = useApiPath('/flyers/regenerate')
    const generatePath = useApiPath('/flyers/generate')

    function readFlyer(file: File, onEvent: (event: FlyerReadEvent) => void, signal?: AbortSignal) {
        const body = new FormData()
        body.append('file', file)
        return readDraftStream(fetch(parsePath, { method: 'POST', body, signal }), onEvent)
    }

    function postJson(path: string, body: unknown, signal?: AbortSignal) {
        return fetch(path, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
            signal,
        })
    }

    function generateFlyer(description: string, onEvent: (event: FlyerReadEvent) => void, signal?: AbortSignal) {
        return readDraftStream(postJson(generatePath, { description }, signal), onEvent)
    }

    function regenerateFlyer(draft: FlyerDraft, feedback: string, slideIndex: number, description: string | null, signal?: AbortSignal) {
        return readDraftStream(postJson(regeneratePath, { draft, feedback, slideIndex, description }, signal), () => {})
    }

    return { readFlyer, generateFlyer, regenerateFlyer }
}

export function useBrandActions() {
    const brandPath = useApiPath('/brand')

    async function generateBrand() {
        const brand = await $fetch<Brand>(brandPath, { method: 'POST' })
        await refreshNuxtData('organization')
        return brand
    }

    return { generateBrand }
}

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong') {
    if (error && typeof error === 'object' && 'data' in error) {
        const data = (error as { data?: { statusMessage?: string } }).data
        if (data?.statusMessage) return data.statusMessage
    }
    return fallback
}
