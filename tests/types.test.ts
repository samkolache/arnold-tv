import { describe, expect, it } from 'vitest'
import { AiIssueSchema, FlyerSchema, OrganizationSchema, WeeklyStatsSchema } from '~/types'
import { getFlyerStatus } from '~/utils/flyerStatus'

const id = () => crypto.randomUUID()

const flyer = {
    id: id(),
    organizationId: id(),
    title: 'Holiday hours',
    type: 'one_time',
    startDate: '2026-11-02',
    endDate: '2026-11-27',
    paused: false,
    image: 'https://example.com/flyer.png',
    slides: [
        {
            id: id(),
            tag: 'FREE CLASS',
            headline: 'Yoga w/ Sebastien',
            days: ['mon', 'wed'],
            times: ['18:00'],
            extraTimes: { mon: ['19:00'] },
            when: null,
            supportingLine: null,
            signUpUrl: 'https://example.com/signup',
            qrLabel: 'Scan to save your spot',
        },
    ],
    qrScans: 42,
}

describe('schemas', () => {
    it('accepts a valid flyer', () => {
        expect(FlyerSchema.safeParse(flyer).success).toBe(true)
    })

    it('rejects a one-time flyer without an end date', () => {
        expect(FlyerSchema.safeParse({ ...flyer, endDate: null }).success).toBe(false)
    })

    it('rejects an end date before the start date', () => {
        expect(FlyerSchema.safeParse({ ...flyer, endDate: '2026-11-01' }).success).toBe(false)
    })

    it('accepts a weekly flyer with no end date', () => {
        expect(FlyerSchema.safeParse({ ...flyer, type: 'weekly', endDate: null }).success).toBe(true)
    })

    it('validates an organization', () => {
        const hours = { open: '06:00', close: '22:00' }
        const org = {
            id: id(),
            name: 'Arnold Gym',
            slug: 'arnold-gym',
            logo: null,
            timezone: 'America/New_York',
            gymHours: { mon: hours, tue: hours, wed: hours, thu: hours, fri: hours, sat: hours, sun: null },
        }
        expect(OrganizationSchema.safeParse(org).success).toBe(true)
        expect(OrganizationSchema.safeParse({ ...org, timezone: 'Mars/Base' }).success).toBe(false)
        expect(OrganizationSchema.safeParse({ ...org, slug: 'Arnold Gym' }).success).toBe(false)
    })

    it('validates an AI issue and weekly stats', () => {
        expect(
            AiIssueSchema.safeParse({
                id: id(),
                flyerId: flyer.id,
                slideId: flyer.slides[0]!.id,
                field: 'times',
                message: "Couldn't read the class time",
                resolved: false,
                createdAt: '2026-11-08T17:18:00Z',
            }).success,
        ).toBe(true)

        const week = { scans: 42, signUps: 10, topSlide: { slideId: flyer.slides[0]!.id, flyerId: flyer.id, headline: 'Yoga', scans: 20 } }
        expect(
            WeeklyStatsSchema.safeParse({
                ...week,
                organizationId: id(),
                lastWeek: { scans: 30, signUps: 15, topSlide: null },
            }).success,
        ).toBe(true)
    })
})

describe('getFlyerStatus', () => {
    const tz = 'America/New_York'

    it('is scheduled before the start date', () => {
        expect(getFlyerStatus(flyer, tz, new Date('2026-11-01T15:00:00Z'))).toBe('scheduled')
    })

    it('is live between start and end dates, inclusive', () => {
        expect(getFlyerStatus(flyer, tz, new Date('2026-11-27T15:00:00Z'))).toBe('live')
    })

    it('is ended after the end date', () => {
        expect(getFlyerStatus(flyer, tz, new Date('2026-11-28T15:00:00Z'))).toBe('ended')
    })

    it('is paused when paused and not yet ended', () => {
        expect(getFlyerStatus({ ...flyer, paused: true }, tz, new Date('2026-11-10T15:00:00Z'))).toBe('paused')
    })

    it('uses the gym timezone, not UTC', () => {
        expect(getFlyerStatus(flyer, tz, new Date('2026-11-28T03:00:00Z'))).toBe('live')
    })

    it('never ends a weekly flyer with no end date', () => {
        expect(getFlyerStatus({ ...flyer, endDate: null }, tz, new Date('2030-01-01T15:00:00Z'))).toBe('live')
    })
})
