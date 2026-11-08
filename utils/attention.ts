import type { AiIssue, AiIssueField } from '~/types/ai-issue'
import type { Flyer } from '~/types/flyer'

const FIELD_LABELS: Record<AiIssueField, string> = {
    title: 'title',
    startDate: 'start date',
    endDate: 'end date',
    image: 'image',
    headline: 'headline',
    days: 'class day',
    times: 'class time',
    supportingLine: 'supporting line',
    signUpUrl: 'sign-up link',
    tag: 'tag',
    when: 'date',
    qrLabel: 'QR label',
}

export interface AttentionItem {
    id: string
    flyerId: string
    title: string
    description: string
}

export function groupAiIssues(issues: AiIssue[], flyers: Flyer[]): AttentionItem[] {
    const groups = new Map<string, AiIssue[]>()

    for (const issue of issues) {
        const key = `${issue.flyerId}:${issue.field}`
        groups.set(key, [...(groups.get(key) ?? []), issue])
    }

    return [...groups.entries()].map(([key, group]) => {
        const [first] = group as [AiIssue, ...AiIssue[]]
        const flyer = flyers.find((candidate) => candidate.id === first.flyerId)
        const label = FIELD_LABELS[first.field]
        const headlines = new Set(
            group.flatMap((issue) => {
                const slide = flyer?.slides.find((candidate) => candidate.id === issue.slideId)
                return slide ? [slide.headline] : []
            }),
        )

        return {
            id: key,
            flyerId: first.flyerId,
            title: `AI wasn't sure about ${group.length} ${label}${group.length === 1 ? '' : 's'}`,
            description: [flyer?.title, ...headlines].filter(Boolean).join(' · '),
        }
    })
}
