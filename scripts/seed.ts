import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import { addDays, addMinutes, subDays, subHours } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL
const key = process.env.NUXT_SUPABASE_SECRET_KEY
if (!url || !key) throw new Error('Set NUXT_PUBLIC_SUPABASE_URL and NUXT_SUPABASE_SECRET_KEY in .env')

const supabase = createClient<any>(url, key, { auth: { persistSession: false } })

const SLUG = 'the-arnold'
const TIMEZONE = 'America/Chicago'
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const now = new Date()

function check<T>(result: { data: T, error: { message: string } | null }, step: string): T {
    if (result.error) throw new Error(`${step}: ${result.error.message}`)
    return result.data
}

function localDate(offsetDays: number) {
    return formatInTimeZone(addDays(now, offsetDays), TIMEZONE, 'yyyy-MM-dd')
}

async function upload(bucket: string, path: string, file: string, contentType: string) {
    const storage = supabase.storage.from(bucket)
    const body = await readFile(new URL(`../public/${file}`, import.meta.url))
    check(await storage.upload(path, body, { contentType, upsert: true }), `upload ${bucket}/${path}`)
    return storage.getPublicUrl(path).data.publicUrl
}

function randomActivityTime(since: Date, until: Date) {
    for (;;) {
        const time = new Date(since.getTime() + Math.random() * (until.getTime() - since.getTime()))
        const hour = Number(formatInTimeZone(time, TIMEZONE, 'H'))
        if (hour >= 6 && hour < 22) return time
    }
}

function shuffle<T>(items: T[]) {
    return items
        .map((item) => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item)
}

check(await supabase.from('organizations').delete().eq('slug', SLUG), 'delete organization')

const [logo, classScheduleImage, holidayImage] = await Promise.all([
    upload('logos', `${SLUG}/logo.jpeg`, 'arnold-logo.jpeg', 'image/jpeg'),
    upload('flyers', `${SLUG}/free-class-schedule.png`, 'example-flyer.png', 'image/png'),
    upload('flyers', `${SLUG}/holiday-hours.png`, 'holiday-hours.png', 'image/png'),
])

const organizationId = crypto.randomUUID()

check(
    await supabase.from('organizations').insert({
        id: organizationId,
        name: 'The Arnold',
        slug: SLUG,
        logo,
        timezone: TIMEZONE,
        gym_hours: Object.fromEntries(DAYS.map((day) => [day, { open: '05:00', close: '23:00' }])),
    }),
    'insert organization',
)

const flyerIds = {
    classes: crypto.randomUUID(),
    holiday: crypto.randomUUID(),
    smoothie: crypto.randomUUID(),
}

check(
    await supabase.from('flyers').insert([
        {
            id: flyerIds.classes,
            organization_id: organizationId,
            title: 'Free class schedule',
            type: 'weekly',
            start_date: localDate(-14),
            end_date: null,
            image: classScheduleImage,
        },
        {
            id: flyerIds.holiday,
            organization_id: organizationId,
            title: 'Holiday hours',
            type: 'one_time',
            start_date: localDate(0),
            end_date: '2026-11-27',
            image: holidayImage,
        },
        {
            id: flyerIds.smoothie,
            organization_id: organizationId,
            title: 'Smoothie bar opening',
            type: 'one_time',
            start_date: localDate(3),
            end_date: localDate(10),
            image: null,
        },
    ]),
    'insert flyers',
)

const slideIds = {
    boxing: crypto.randomUUID(),
    afrobeats: crypto.randomUUID(),
    sebastien: crypto.randomUUID(),
}

check(
    await supabase.from('slides').insert([
        {
            id: slideIds.boxing,
            flyer_id: flyerIds.classes,
            position: 0,
            tag: 'FREE CLASS',
            headline: 'Boxing & Kickboxing',
            days: ['tue', 'thu'],
            times: ['09:30'],
            extra_times: { tue: ['10:30'] },
            supporting_line: 'Free · bring water',
            sign_up_url: 'https://thearnold.example/classes/boxing',
            qr_label: 'Scan to save your spot',
        },
        {
            id: slideIds.afrobeats,
            flyer_id: flyerIds.classes,
            position: 1,
            tag: 'FREE CLASS',
            headline: 'Afrobeats Yoga',
            days: ['tue', 'thu'],
            times: ['18:00'],
            supporting_line: 'Bring your own mat',
            sign_up_url: 'https://thearnold.example/classes/afrobeats-yoga',
            qr_label: 'Scan to save your spot',
        },
        {
            id: slideIds.sebastien,
            flyer_id: flyerIds.classes,
            position: 2,
            tag: 'FREE CLASS',
            headline: 'Yoga w/ Sebastien',
            days: ['sat'],
            times: ['14:00'],
            supporting_line: 'Bring your own mat',
            sign_up_url: 'https://thearnold.example/classes/yoga-sebastien',
            qr_label: 'Scan to save your spot',
        },
        {
            flyer_id: flyerIds.holiday,
            position: 0,
            tag: 'THANKSGIVING',
            headline: 'Holiday hours',
            when_text: 'Closed Thu, Nov 26',
            supporting_line: 'Gym reopens Friday at 8 AM',
        },
        {
            flyer_id: flyerIds.holiday,
            position: 1,
            tag: 'THANKSGIVING',
            headline: 'Short day Friday',
            when_text: 'Fri, Nov 27 · 8 AM – 4 PM',
            supporting_line: 'Regular hours return Saturday',
        },
        {
            flyer_id: flyerIds.smoothie,
            position: 0,
            tag: 'NEW',
            headline: 'Smoothie bar',
            when_text: 'Opens Mon · 7 AM',
            supporting_line: 'Your first smoothie is on us',
            sign_up_url: 'https://thearnold.example/smoothie-menu',
            qr_label: 'Scan for the menu',
        },
    ], { defaultToNull: false }),
    'insert slides',
)

check(
    await supabase.from('ai_issues').insert({
        flyer_id: flyerIds.classes,
        slide_id: slideIds.sebastien,
        field: 'times',
        message: 'Photo is blurry here. Is it 2 PM?',
        created_at: subHours(now, 1).toISOString(),
    }),
    'insert ai issue',
)

const weeks = [
    {
        since: subDays(now, 7),
        until: now,
        scans: { boxing: 20, afrobeats: 14, sebastien: 8 },
        signUps: { boxing: 5, afrobeats: 3, sebastien: 2 },
    },
    {
        since: subDays(now, 14),
        until: subDays(now, 7),
        scans: { boxing: 15, afrobeats: 10, sebastien: 5 },
        signUps: { boxing: 3, afrobeats: 3, sebastien: 1 },
    },
]

const scanRows: { id: string, flyer_id: string, slide_id: string, scanned_at: string }[] = []
const signUpRows: { flyer_id: string, slide_id: string, qr_scan_id: string, signed_up_at: string }[] = []

for (const week of weeks) {
    for (const slide of Object.keys(slideIds) as (keyof typeof slideIds)[]) {
        const scans = Array.from({ length: week.scans[slide] }, () => ({
            id: crypto.randomUUID(),
            flyer_id: flyerIds.classes,
            slide_id: slideIds[slide],
            scanned_at: randomActivityTime(week.since, week.until),
        }))

        const signUpScans = shuffle(scans.filter((scan) => addMinutes(scan.scanned_at, 10) < week.until))
            .slice(0, week.signUps[slide])

        if (signUpScans.length < week.signUps[slide]) throw new Error(`Not enough scans for ${slide} sign-ups`)

        scanRows.push(...scans.map((scan) => ({ ...scan, scanned_at: scan.scanned_at.toISOString() })))
        signUpRows.push(...signUpScans.map((scan) => ({
            flyer_id: scan.flyer_id,
            slide_id: scan.slide_id,
            qr_scan_id: scan.id,
            signed_up_at: addMinutes(scan.scanned_at, 2 + Math.random() * 8).toISOString(),
        })))
    }
}

check(await supabase.from('qr_scans').insert(scanRows), 'insert qr scans')
check(await supabase.from('sign_ups').insert(signUpRows), 'insert sign-ups')

console.log(`Seeded ${SLUG}: 3 flyers, 6 slides, 1 AI issue, ${scanRows.length} scans, ${signUpRows.length} sign-ups`)
