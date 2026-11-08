import { describe, expect, it } from 'vitest'
import type { AiIssue, Flyer } from '~/types'
import { groupAiIssues } from '~/utils/attention'
import { describeFlyerStatus } from '~/utils/flyerDisplay'
import { buildRotation, getRotationPosition } from '~/utils/rotation'

const tz = 'America/Chicago'
const now = new Date('2026-11-08T18:00:00Z')
const id = () => crypto.randomUUID()

const slide = (headline: string) => ({
    id: id(),
    tag: null,
    headline,
    days: [],
    times: [],
    extraTimes: {},
    when: null,
    supportingLine: null,
    signUpUrl: null,
    qrLabel: null,
})

const flyer = (overrides: Partial<Flyer>): Flyer => ({
    id: id(),
    organizationId: id(),
    title: 'Flyer',
    type: 'weekly',
    startDate: '2026-10-25',
    endDate: null,
    paused: false,
    image: null,
    slides: [slide('Slide')],
    qrScans: 0,
    ...overrides,
})

const classes = flyer({
    title: 'Free class schedule',
    slides: [slide('Boxing & Kickboxing'), slide('Afrobeats Yoga'), slide('Yoga w/ Sebastien')],
})
const holiday = flyer({
    title: 'Holiday hours',
    type: 'one_time',
    startDate: '2026-11-08',
    endDate: '2026-11-27',
    slides: [slide('Holiday hours'), slide('Short day Friday')],
})
const smoothie = flyer({ title: 'Smoothie bar', type: 'one_time', startDate: '2026-11-11', endDate: '2026-11-18' })

describe('buildRotation', () => {
    const rotation = buildRotation([classes, holiday, smoothie], tz, now)

    it('puts one-time flyers first and expands weekly flyers into slides', () => {
        expect(rotation.map((item) => item.title)).toEqual([
            'Holiday hours',
            'Boxing & Kickboxing',
            'Afrobeats Yoga',
            'Yoga w/ Sebastien',
        ])
        expect(rotation[0]!.meta).toBe('comes off after Nov 27')
    })

    it('loops 5 slides in 50 seconds', () => {
        expect(getRotationPosition(rotation, 0)).toEqual({ activeIndex: 0, progress: 0, secondsUntilNext: 20, loopSeconds: 50 })
        expect(getRotationPosition(rotation, 25_000)).toMatchObject({ activeIndex: 1, progress: 50, secondsUntilNext: 5 })
        expect(getRotationPosition(rotation, 75_000)).toMatchObject({ activeIndex: 1 })
    })

    it('handles an empty rotation', () => {
        expect(getRotationPosition([], 1000).loopSeconds).toBe(0)
    })
})

describe('describeFlyerStatus', () => {
    it('describes each status', () => {
        expect(describeFlyerStatus(classes, 'live')).toBe('Plays until you remove it')
        expect(describeFlyerStatus(holiday, 'live')).toBe('Comes off after Nov 27')
        expect(describeFlyerStatus(smoothie, 'scheduled')).toBe('Starts Wed, Nov 11 · off after Nov 18')
    })
})

describe('groupAiIssues', () => {
    it('groups issues by flyer and field with slide names', () => {
        const issue = (slideId: string): AiIssue => ({
            id: id(),
            flyerId: classes.id,
            slideId,
            field: 'times',
            message: 'Blurry',
            resolved: false,
            createdAt: '2026-11-08T17:00:00Z',
        })

        expect(groupAiIssues([issue(classes.slides[2]!.id)], [classes])).toMatchObject([
            { title: "AI wasn't sure about 1 class time", description: 'Free class schedule · Yoga w/ Sebastien' },
        ])
        expect(groupAiIssues([issue(classes.slides[0]!.id), issue(classes.slides[1]!.id)], [classes])[0]!.title)
            .toBe("AI wasn't sure about 2 class times")
    })
})
