import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'

type ContentBlock = Anthropic.Beta.Messages.BetaContentBlockParam
type MessageParam = Anthropic.Beta.Messages.BetaMessageParam

let client: Anthropic | undefined

function useAnthropic() {
    if (!client) {
        const apiKey = useRuntimeConfig().anthropicApiKey
        if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'Set NUXT_ANTHROPIC_API_KEY in .env' })
        client = new Anthropic({ apiKey })
    }
    return client
}

interface AskForJsonOptions<Result> {
    system: string
    content: ContentBlock[]
    format: z.ZodType
    schema: z.ZodType<Result>
    onText?: (snapshot: string) => void
    onRetry?: () => void
    signal?: AbortSignal
}

export async function askClaudeForJson<Result>({ system, content, format, schema, onText, onRetry, signal }: AskForJsonOptions<Result>): Promise<Result | null> {
    const messages: MessageParam[] = [{ role: 'user', content }]

    for (let attempt = 1; attempt <= 2; attempt++) {
        const stream = useAnthropic().beta.messages.stream({
            model: 'claude-opus-5-5',
            max_tokens: 16000,
            system,
            messages,
            output_config: { effort: 'medium', format: betaZodOutputFormat(format) },
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
        }, { signal })

        if (onText) stream.on('text', (_delta, snapshot) => onText(snapshot))
        const response = await stream.finalMessage()

        if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') {
            console.warn('[claude] stopped early', response.stop_reason, response.stop_details)
            return null
        }

        const text = response.content.find((block) => block.type === 'text')?.text ?? ''
        let problem: string

        try {
            const result = schema.safeParse(JSON.parse(text))
            if (result.success) return result.data
            problem = z.prettifyError(result.error)
        } catch {
            problem = 'The response was not valid JSON.'
        }

        console.warn(`[claude] attempt ${attempt} failed validation`, problem)
        if (attempt === 1) onRetry?.()
        messages.push(
            { role: 'assistant', content: response.content },
            { role: 'user', content: `That JSON failed validation:\n${problem}\n\nFix these problems and return the full corrected JSON.` },
        )
    }

    return null
}
