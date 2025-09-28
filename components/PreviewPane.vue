<script setup lang="ts">
import { marked } from 'marked'
import { onMounted, ref, watch } from 'vue'

let dompurify: typeof import('dompurify') | null = null

const props = defineProps<{
  content: string
}>()

const html = ref('')

const render = async () => {
  const raw = await marked.parse(props.content || '', { breaks: true })
  if (process.client) {
    if (!dompurify) {
      dompurify = await import('dompurify')
    }
    const createDOMPurify = dompurify.default
    const purifier = createDOMPurify(window)
    html.value = purifier.sanitize(raw)
  } else {
    html.value = raw
  }
}

watch(
  () => props.content,
  () => {
    render()
  },
  { immediate: true }
)

onMounted(() => {
  render()
})
</script>

<template>
  <div class="flex h-full flex-col gap-3">
    <header>
      <h2 class="text-lg font-semibold text-slate-100">Live Preview</h2>
      <p class="text-sm text-slate-400">Filled template rendered in real time.</p>
    </header>
    <div class="prose prose-invert max-w-none flex-1 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/60 p-6">
      <div v-if="!content" class="text-sm text-slate-400">Start typing in the editor to see the preview.</div>
      <div v-else v-html="html" class="prose prose-invert max-w-none"></div>
    </div>
  </div>
</template>
