import { ref } from 'vue'
import type { ChatMessage } from '@/components/ChatBox.vue'

interface GenerateOptions {
  template: string
  placeholders: Record<string, string>
  messages: ChatMessage[]
}

interface GenerateResponse {
  placeholders: Record<string, string>
  assistantMessage: string
}

export const useAI = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const generate = async ({ template, placeholders, messages }: GenerateOptions): Promise<GenerateResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<GenerateResponse>('/api/generate', {
        method: 'POST',
        body: {
          template,
          placeholders,
          messages
        }
      })
      return response
    } catch (err) {
      console.error('AI generation failed', err)
      error.value =
        (err as { statusMessage?: string })?.statusMessage || 'Unable to contact the AI service. Please try again.'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    generate
  }
}
