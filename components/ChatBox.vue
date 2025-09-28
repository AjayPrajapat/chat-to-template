<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

type Role = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: Role
  content: string
  createdAt: string
}

const props = defineProps<{
  messages: ChatMessage[]
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', value: string): void
  (e: 'regenerate'): void
}>()

const input = ref('')
const containerRef = ref<HTMLDivElement | null>(null)

const canSend = computed(() => input.value.trim().length > 0 && !props.loading && !props.disabled)

const scrollToBottom = async () => {
  await nextTick()
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight
  }
}

watch(
  () => props.messages,
  () => {
    scrollToBottom()
  },
  { deep: true }
)

const handleSend = () => {
  if (!canSend.value) return
  emit('send', input.value.trim())
  input.value = ''
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="flex flex-col h-full gap-3">
    <header class="flex items-center justify-between gap-2">
      <div>
        <h2 class="text-lg font-semibold text-slate-100">Chat</h2>
        <p class="text-sm text-slate-400">Ask the AI for context to fill in your template.</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-sm text-slate-200 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loading || !messages.length"
        @click="emit('regenerate')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992V4.356m0 0a9.173 9.173 0 10-3.022 6.769M8.977 14.652H3.985v4.992m0 0a9.173 9.173 0 103.022-6.769" />
        </svg>
        Regenerate Answer
      </button>
    </header>

    <div
      ref="containerRef"
      class="flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/60 p-4"
    >
      <p v-if="!messages.length" class="text-sm text-slate-400">
        Start the conversation to generate placeholder values.
      </p>
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex flex-col gap-1 rounded-lg border border-transparent bg-slate-800/60 p-3"
        :class="{
          'border-primary/40 bg-primary/10 text-slate-100': message.role === 'assistant',
          'border-slate-700 bg-slate-900/60 text-slate-200': message.role === 'user'
        }"
      >
        <div class="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
          <span>{{ message.role === 'assistant' ? 'Assistant' : 'You' }}</span>
          <span>{{ new Date(message.createdAt).toLocaleTimeString() }}</span>
        </div>
        <p class="whitespace-pre-wrap text-sm leading-relaxed">{{ message.content }}</p>
      </div>
      <div v-if="loading" class="flex items-center gap-2 text-sm text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0 1 12.42-5.46m2.08 5.46a7.5 7.5 0 0 1-12.42 5.46" />
        </svg>
        Waiting for AI response...
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label for="chat-input" class="text-xs uppercase tracking-wide text-slate-400">Your message</label>
      <textarea
        id="chat-input"
        v-model="input"
        class="min-h-[96px] resize-y rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Describe what should go into the template placeholders..."
        :disabled="disabled"
        @keydown="handleKeydown"
      />
      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canSend"
          @click="handleSend"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6.375l10.5 1.125-10.5 1.125z" />
          </svg>
          Send
        </button>
      </div>
    </div>
  </div>
</template>
