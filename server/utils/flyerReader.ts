import type { H3Event } from 'h3'
import { z } from 'zod'
import { formatInTimeZone } from 'date-fns-tz'
import {
    AiIssueFieldSchema,
    FlyerDraftChangeSchema,
    FlyerDraftIssueSchema,
    FlyerInputSchema,
    FlyerTypeSchema,
    IsoDateSchema,
    SlideKindSchema,
    SlideSchema,
    TimeSchema,
    type DayOfWeek,
    type FlyerDraft,
    type FlyerReadEvent,
    type SlideKind,
    type SlideKindCounts,
} from '~/types'

type ContentBlock = Parameters<typeof askClaudeForJson>[0]['content'][number]

export const FLYER_READ_FAILED = "Couldn't read this flyer"

const SYSTEM_PROMPT = `You read gym and apartment-community flyers and turn them into TV slides.

The slides are shown on a TV in an apartment gym and read from about 15 feet away,
in a 3–5 second glance, by residents who are mid-workout. You only extract and
shorten content. You never design anything: a fixed template handles all styling.

Rules:
- Make one slide per class, event or announcement. A schedule with 3 classes = 3 slides.
  If the same class appears at several times, combine it into one slide.
- Pick a \`kind\` for each slide: class, event, hours, closure, new, announcement.
- headline: the name of the thing, max 24 characters. Shorten wording if needed.
- tag: optional, max 14 characters, only if the flyer suggests something more specific
  than the kind (e.g. "THANKSGIVING"). Otherwise leave it empty.
- when: the single most important fact, max 28 characters: a time, a date, or a status
  (e.g. "Closed Thu, Nov 26"). For classes, leave \`when\` empty and fill \`days\` and \`times\`.
- days: numbers, 0 = Sunday … 6 = Saturday. times: 24-hour strings like "18:00".
- supportingLine: optional, max 40 characters, one useful detail (e.g. "Bring your own mat").
- Leave out phone numbers, fine print, decorative text and anything already on the slide.
- Never invent information. If something isn't on the flyer, leave it empty.
- type: "weekly" if the flyer lists repeating days, "one_time" if it lists specific dates.
  endDate: the last date the flyer is relevant, if there is one.
- If any text is hard to read (blurry, cut off, low contrast), give your best guess and
  add an entry to \`issues\` with the slide index, the field, and a short question for staff,
  like "Photo is blurry here. Is it 2 PM?"
- In \`changes\`, list in plain words what you shortened, combined or left out,
  e.g. "Removed phone number", "Combined 3 Boxing times into one slide".

Field notes:
- title: a short name for the whole flyer, for the gym staff's dashboard.
- startDate / endDate: YYYY-MM-DD. If the flyer gives no start date, use today's date. One-time flyers need an end date.
- signUpUrl: only set it when the slide has a real action (sign-up, RSVP, menu, or a link printed on the flyer). Use the flyer's QR code link when it is that action. Otherwise null.
- qrLabel: the text printed next to the QR code, if it fits the action, otherwise null.
- issues and changes: slideIndex is the 0-based slide the note is about, or null if it is about the whole flyer.

Return only JSON matching the provided schema.`

const DraftSlideFormatSchema = z.object({
    kind: SlideKindSchema,
    tag: z.string().nullable(),
    headline: z.string(),
    supportingLine: z.string().nullable(),
    when: z.string().nullable(),
    days: z.array(z.int()),
    times: z.array(z.string()),
    signUpUrl: z.string().nullable(),
    qrLabel: z.string().nullable(),
})

const DraftFormatSchema = z.object({
    title: z.string(),
    type: FlyerTypeSchema,
    startDate: z.string(),
    endDate: z.string().nullable(),
    slides: z.array(DraftSlideFormatSchema),
    issues: z.array(z.object({ slideIndex: z.int().nullable(), field: AiIssueFieldSchema, message: z.string() })),
    changes: z.array(z.object({ slideIndex: z.int().nullable(), message: z.string() })),
})

const DAYS_BY_NUMBER: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function optionalText(max?: number) {
    const text = max ? z.string().trim().max(max) : z.string().trim()
    return text.nullable().transform((value) => value || null)
}

const DraftSlideSchema = z.object({
    kind: SlideKindSchema,
    tag: optionalText(14),
    headline: SlideSchema.shape.headline.max(24),
    supportingLine: optionalText(40),
    when: optionalText(28),
    days: z.array(z.int().min(0).max(6)).transform((days) => [...new Set(days)].sort().map((day) => DAYS_BY_NUMBER[day]!)),
    times: z.array(TimeSchema),
    signUpUrl: optionalText().pipe(SlideSchema.shape.signUpUrl),
    qrLabel: optionalText(),
})

const DraftSchema = z.object({
    title: z.string().trim().min(1),
    type: FlyerTypeSchema,
    startDate: IsoDateSchema,
    endDate: IsoDateSchema.nullable(),
    slides: z.array(DraftSlideSchema).min(1, 'Make at least one slide'),
    issues: z.array(FlyerDraftIssueSchema),
    changes: z.array(FlyerDraftChangeSchema),
})

const KIND_PATTERN = new RegExp(`"kind"\\s*:\\s*"(${SlideKindSchema.options.join('|')})"`, 'g')

function countKinds(kinds: SlideKind[]) {
    const counts: SlideKindCounts = {}
    for (const kind of kinds) counts[kind] = (counts[kind] ?? 0) + 1
    return counts
}

function trackProgress(send: (event: FlyerReadEvent) => void) {
    let stage: 'read' | 'slides' | 'check' = 'read'
    let found = ''

    return (snapshot: string) => {
        if (stage === 'check') return

        const slidesStart = snapshot.indexOf('"slides"')
        if (slidesStart === -1) return

        if (stage === 'read') {
            stage = 'slides'
            send({ type: 'stage', stage })
        }

        const issuesStart = snapshot.indexOf('"issues"', slidesStart)
        const slidesText = snapshot.slice(slidesStart, issuesStart === -1 ? undefined : issuesStart)
        const kinds = countKinds([...slidesText.matchAll(KIND_PATTERN)].map((match) => match[1] as SlideKind))
        const key = JSON.stringify(kinds)

        if (key !== found) {
            found = key
            send({ type: 'found', kinds })
        }

        if (issuesStart !== -1) {
            stage = 'check'
            send({ type: 'stage', stage })
        }
    }
}

export function describedFlyerRequest(description: string) {
    return [
        'There is no flyer image. A staff member typed what they want on the TV:',
        `"""${description}"""`,
        'Treat this text as the flyer and follow the same rules. Only use details it gives, and leave out anything it doesn\'t say. If something is unclear, like a time without AM or PM, give your best guess and add it to issues.',
    ].join('\n\n')
}

export function toClaudeDraft({ flyer, issues, changes }: FlyerDraft) {
    return {
        title: flyer.title,
        type: flyer.type,
        startDate: flyer.startDate,
        endDate: flyer.endDate,
        slides: flyer.slides.map((slide) => ({
            kind: slide.kind,
            tag: slide.tag,
            headline: slide.headline,
            supportingLine: slide.supportingLine,
            when: slide.when,
            days: slide.days.map((day) => DAYS_BY_NUMBER.indexOf(day)),
            times: slide.times,
            signUpUrl: slide.signUpUrl,
            qrLabel: slide.qrLabel,
        })),
        issues,
        changes,
    }
}

export async function downloadFlyerImage(event: H3Event, organizationId: string, url: string) {
    const storage = useSupabaseAdmin(event).storage.from('flyers')
    const prefix = storage.getPublicUrl(`${organizationId}/`).data.publicUrl
    const file = url.startsWith(prefix) ? url.slice(prefix.length) : ''

    if (!/^[0-9a-f-]+\.(png|jpg|webp)$/.test(file)) {
        throw createError({ statusCode: 400, statusMessage: 'Unknown flyer image' })
    }

    const { data, error } = await storage.download(`${organizationId}/${file}`)
    if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Flyer image not found' })

    return Buffer.from(await data.arrayBuffer())
}

interface StreamFlyerDraftOptions {
    organization: { timezone: string }
    image: ContentBlock | null
    imageUrl: string | null
    qrUrl: string | null
    request: string
}

export function streamFlyerDraft(event: H3Event, { organization, image, imageUrl, qrUrl, request }: StreamFlyerDraftOptions) {
    const today = formatInTimeZone(new Date(), organization.timezone, 'yyyy-MM-dd (EEEE)')
    const notes = [`Today is ${today}.`]
    if (qrUrl) notes.push(`The flyer's QR code links to ${qrUrl}.`)

    const DraftFlyerSchema = DraftSchema.transform(({ issues, changes, slides, ...fields }, ctx) => {
        const flyer = FlyerInputSchema.safeParse({ ...fields, image: imageUrl, slides })

        if (!flyer.success) {
            for (const issue of flyer.error.issues) {
                ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path })
            }
            return z.NEVER
        }

        return { flyer: flyer.data, issues, changes }
    })

    const abort = new AbortController()
    event.node.req.on('close', () => abort.abort())
    const encoder = new TextEncoder()

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const send = (message: FlyerReadEvent) => {
                if (!abort.signal.aborted) controller.enqueue(encoder.encode(`${JSON.stringify(message)}\n`))
            }

            try {
                send({ type: 'stage', stage: 'read' })

                const draft = await askClaudeForJson({
                    system: SYSTEM_PROMPT,
                    content: [...(image ? [image] : []), { type: 'text', text: `${notes.join(' ')}\n\n${request}` }],
                    format: DraftFormatSchema,
                    schema: DraftFlyerSchema,
                    onText: trackProgress(send),
                    onRetry: () => send({ type: 'retry' }),
                    signal: abort.signal,
                })

                if (!draft) {
                    send({ type: 'error', message: FLYER_READ_FAILED })
                    return
                }

                send({ type: 'found', kinds: countKinds(draft.flyer.slides.map((slide) => slide.kind)) })
                send({ type: 'draft', draft: { ...draft, qrUrl } })
            } catch (error) {
                if (!abort.signal.aborted) {
                    console.error('[flyer reader]', error)
                    send({ type: 'error', message: FLYER_READ_FAILED })
                }
            } finally {
                if (!abort.signal.aborted) controller.close()
            }
        },
        cancel() {
            abort.abort()
        },
    })

    setResponseHeader(event, 'content-type', 'application/x-ndjson')
    setResponseHeader(event, 'cache-control', 'no-cache')
    return sendStream(event, stream)
}
