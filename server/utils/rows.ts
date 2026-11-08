import { SLIDE_SECONDS } from '~/types'
import type { AiIssue, Brand, AiIssueField, DayOfWeek, ExtraTimes, Flyer, FlyerType, GymHours, Organization, Slide, SlideInput, SlideKind } from '~/types'

export interface OrganizationRow {
    id: string
    name: string
    slug: string
    logo: string | null
    timezone: string
    gym_hours: GymHours
    brand: Brand | null
    created_at: string
}

export interface SlideRow {
    id: string
    flyer_id: string
    position: number
    kind: SlideKind
    tag: string | null
    headline: string
    days: DayOfWeek[]
    times: string[]
    extra_times: ExtraTimes
    when_text: string | null
    supporting_line: string | null
    sign_up_url: string | null
    qr_label: string | null
    duration_seconds: number
    created_at: string
    qr_scans?: { count: number }[]
}

export interface FlyerRow {
    id: string
    organization_id: string
    title: string
    type: FlyerType
    start_date: string
    end_date: string | null
    paused: boolean
    image: string | null
    created_at: string
}

export interface FlyerWithSlidesRow extends FlyerRow {
    slides: SlideRow[]
}

export interface AiIssueRow {
    id: string
    flyer_id: string
    slide_id: string | null
    field: AiIssueField
    message: string
    resolved: boolean
    created_at: string
}

export interface SlideActivityRow {
    slide_id: string
    flyer_id: string
    headline: string
    scans: number
    sign_ups: number
}

export function toOrganization(row: OrganizationRow): Organization {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        logo: row.logo,
        timezone: row.timezone,
        gymHours: row.gym_hours,
        brand: row.brand,
    }
}

export function toSlide(row: SlideRow): Slide {
    return {
        id: row.id,
        kind: row.kind ?? 'announcement',
        tag: row.tag,
        headline: row.headline,
        days: row.days,
        times: row.times,
        extraTimes: row.extra_times,
        when: row.when_text,
        supportingLine: row.supporting_line,
        signUpUrl: row.sign_up_url,
        qrLabel: row.qr_label,
        durationSeconds: row.duration_seconds ?? SLIDE_SECONDS.default,
    }
}

export function toFlyer(row: FlyerWithSlidesRow): Flyer {
    return {
        id: row.id,
        organizationId: row.organization_id,
        title: row.title,
        type: row.type,
        startDate: row.start_date,
        endDate: row.end_date,
        paused: row.paused,
        image: row.image,
        slides: [...row.slides].sort((a, b) => a.position - b.position).map(toSlide),
        qrScans: row.slides.reduce((total, slide) => total + (slide.qr_scans?.[0]?.count ?? 0), 0),
    }
}

export function toAiIssue(row: AiIssueRow): AiIssue {
    return {
        id: row.id,
        flyerId: row.flyer_id,
        slideId: row.slide_id,
        field: row.field,
        message: row.message,
        resolved: row.resolved,
        createdAt: row.created_at,
    }
}

export function toFlyerFieldsRow(flyer: Partial<Pick<Flyer, 'title' | 'type' | 'startDate' | 'endDate' | 'paused' | 'image'>>) {
    return {
        title: flyer.title,
        type: flyer.type,
        start_date: flyer.startDate,
        end_date: flyer.endDate,
        paused: flyer.paused,
        image: flyer.image,
    }
}

export function toSlideRows(flyerId: string, slides: SlideInput[]) {
    return slides.map((slide, position) => ({
        id: slide.id ?? crypto.randomUUID(),
        flyer_id: flyerId,
        position,
        kind: slide.kind,
        tag: slide.tag,
        headline: slide.headline,
        days: slide.days,
        times: slide.times,
        extra_times: slide.extraTimes,
        when_text: slide.when,
        supporting_line: slide.supportingLine,
        sign_up_url: slide.signUpUrl,
        qr_label: slide.qrLabel,
        duration_seconds: slide.durationSeconds,
    }))
}
