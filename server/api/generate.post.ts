import OpenAI from 'openai'

interface BodyPayload {
  template: string
  placeholders: Record<string, string>
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    createdAt: string
  }>
}

const formatConversation = (messages: BodyPayload['messages']): string => {
  if (!messages?.length) return 'No conversation provided.'
  return messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiKey = config.openaiApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing OpenAI API key. Set OPENAI_API_KEY in your environment.'
    })
  }

  const body = await readBody<BodyPayload>(event)
  if (!body?.template) {
    throw createError({ statusCode: 400, statusMessage: 'Template is required.' })
  }

  const client = new OpenAI({ apiKey })

  const prompt = `Fill the following placeholders based on the user input.\n` +
    `Template:\n${body.template}\n` +
    `Existing placeholder values (if any): ${JSON.stringify(body.placeholders)}\n` +
    `User context: ${formatConversation(body.messages)}\n` +
    `Return valid JSON with placeholder names as keys and filled values as strings.`

  try {
    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: `You are a helpful assistant that only responds with JSON objects mapping placeholder names to filled values. Do not include any additional commentary.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    })

    const textOutput = response.output_text ||
      response.output
        ?.flatMap((item) =>
          item.type === 'message'
            ? item.content
                .filter((content) => content.type === 'output_text')
                .map((content) => ('text' in content ? content.text : ''))
            : []
        )
        .join('')

    if (!textOutput) {
      throw new Error('Empty response from OpenAI')
    }

    const parsed = JSON.parse(textOutput) as Record<string, string>

    const assistantSummary = Object.entries(parsed)
      .map(([key, value]) => `{{${key}}}: ${value}`)
      .join('\n') || 'No placeholders were filled.'

    return {
      placeholders: parsed,
      assistantMessage: assistantSummary
    }
  } catch (error) {
    console.error('OpenAI request failed', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to generate placeholder values. Please try again.'
    })
  }
})
