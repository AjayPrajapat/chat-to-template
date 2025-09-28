<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import ChatBox, { type ChatMessage } from '@/components/ChatBox.vue'
import PlaceholderList from '@/components/PlaceholderList.vue'
import PreviewPane from '@/components/PreviewPane.vue'
import exampleTemplate from '@/assets/templates/example.md?raw'
import { useAI } from '@/composables/useAI'

type PlaceholderRecord = Record<string, string>

const template = ref<string>(exampleTemplate)
const placeholderValues = ref<PlaceholderRecord>({})
const chatMessages = ref<ChatMessage[]>([])
const { loading, error, generate } = useAI()

const placeholderNames = computed(() => {
  const matches = template.value.match(/\{\{(.*?)\}\}/g) || []
  const set = new Set<string>()
  matches.forEach((match) => {
    const name = match.replace(/\{\{|\}\}/g, '').trim()
    if (name) set.add(name)
  })
  return Array.from(set)
})

watch(
  placeholderNames,
  (names) => {
    const updated: PlaceholderRecord = {}
    names.forEach((name) => {
      updated[name] = placeholderValues.value[name] ?? ''
    })
    placeholderValues.value = updated
  },
  { immediate: true }
)

const filledMarkdown = computed(() => {
  let output = template.value
  for (const [key, value] of Object.entries(placeholderValues.value)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    output = output.replace(new RegExp(`\\{\\{${escaped}\\}\\}`, 'g'), value || '')
  }
  return output
})

const formatAssistantMessage = (placeholders: PlaceholderRecord) => {
  if (!Object.keys(placeholders).length) {
    return 'No placeholder values were generated.'
  }
  const lines = Object.entries(placeholders).map(([key, value]) => `{{${key}}}: ${value}`)
  return lines.join('\n')
}

const createMessageId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const pushMessage = (role: ChatMessage['role'], content: string) => {
  chatMessages.value.push({
    id: createMessageId(),
    role,
    content,
    createdAt: new Date().toISOString()
  })
}

const requestAI = async () => {
  const response = await generate({
    template: template.value,
    placeholders: placeholderValues.value,
    messages: chatMessages.value
  })

  if (!response) return

  const validKeys = new Set(placeholderNames.value)
  Object.entries(response.placeholders).forEach(([key, value]) => {
    if (validKeys.has(key)) {
      placeholderValues.value[key] = value
    }
  })

  pushMessage('assistant', response.assistantMessage || formatAssistantMessage(response.placeholders))
}

const handleSend = async (message: string) => {
  pushMessage('user', message)
  await requestAI()
}

const handleRegenerate = async () => {
  if (!chatMessages.value.some((msg) => msg.role === 'user')) return
  await requestAI()
}

const handlePlaceholderUpdate = ({ name, value }: { name: string; value: string }) => {
  placeholderValues.value = {
    ...placeholderValues.value,
    [name]: value
  }
}

const handleDownload = () => {
  if (!process.client) return
  const blob = new Blob([filledMarkdown.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'template.md'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  if (!chatMessages.value.length) {
    pushMessage(
      'assistant',
      'Welcome! Provide project details or questions, then press "Send" to generate values for the detected placeholders.'
    )
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col gap-6 p-6">
    <header class="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40">
      <div class="flex flex-col gap-1">
        <p class="text-sm font-medium uppercase tracking-[0.2em] text-primary">Markdown Template Editor</p>
        <h1 class="text-3xl font-bold text-slate-50">Chat-to-Template Workspace</h1>
        <p class="text-sm text-slate-400">
          Build reusable Markdown documents. Ask questions in the chat and the AI will fill placeholder values automatically.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading || !Object.keys(placeholderValues).length"
          @click="handleDownload"
        >
          Download Markdown
        </button>
        <div v-if="error" class="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {{ error }}
        </div>
      </div>
    </header>

    <main class="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-3">
      <section class="xl:col-span-2 flex flex-col gap-6">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="h-[28rem] lg:h-[32rem] xl:h-[36rem]">
            <MarkdownEditor v-model="template" :placeholders="placeholderNames" />
          </div>
          <div class="h-[28rem] lg:h-[32rem] xl:h-[36rem]">
            <PlaceholderList :placeholders="placeholderValues" @update="handlePlaceholderUpdate" />
          </div>
        </div>
        <div class="min-h-[20rem] rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <PreviewPane :content="filledMarkdown" />
        </div>
      </section>
      <aside class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 xl:col-span-1">
        <ChatBox
          :messages="chatMessages"
          :loading="loading"
          :disabled="!placeholderNames.length"
          @send="handleSend"
          @regenerate="handleRegenerate"
        />
      </aside>
    </main>
  </div>
</template>
