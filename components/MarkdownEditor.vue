<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholders: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
let cleanup: (() => void) | null = null

const placeholderExample = '{{placeholder}}'

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const highlighted = computed(() => {
  const base = escapeHtml(props.modelValue || '')
  if (!props.placeholders?.length) {
    return base
  }

  const pattern = props.placeholders
    .map((ph) => ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')

  if (!pattern) {
    return base
  }

  const regex = new RegExp(`\\{\\{(${pattern})\\}\\}`, 'g')
  return base.replace(regex, (_, name: string) => {
    return `<span class="text-primary font-semibold">{{${name}}}</span>`
  })
})

watch(
  () => props.modelValue,
  () => {
    // keep overlay scroll aligned
    requestAnimationFrame(() => {
      if (!textareaRef.value || !overlayRef.value) return
      overlayRef.value.scrollTop = textareaRef.value.scrollTop
      overlayRef.value.scrollLeft = textareaRef.value.scrollLeft
    })
  }
)

onMounted(() => {
  if (!textareaRef.value || !overlayRef.value) return
  const sync = () => {
    if (!textareaRef.value || !overlayRef.value) return
    overlayRef.value.scrollTop = textareaRef.value.scrollTop
    overlayRef.value.scrollLeft = textareaRef.value.scrollLeft
  }
  textareaRef.value.addEventListener('scroll', sync)
  cleanup = () => {
    textareaRef.value?.removeEventListener('scroll', sync)
  }
})

onBeforeUnmount(() => {
  cleanup?.()
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col gap-3 h-full">
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-100">Markdown Template</h2>
        <p class="text-sm text-slate-400">Insert placeholders like <code>{{ placeholderExample }}</code>.</p>
      </div>
    </header>
    <div class="relative flex-1">
      <pre
        ref="overlayRef"
        aria-hidden="true"
        class="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-left bg-slate-950 text-slate-400 p-4 border border-slate-800 rounded-lg overflow-auto"
        v-html="highlighted"
      />
      <textarea
        ref="textareaRef"
        :value="modelValue"
        @input="handleInput"
        spellcheck="false"
        class="w-full h-full resize-none font-mono text-sm leading-relaxed text-slate-100 bg-transparent p-4 border border-slate-800 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 overflow-auto"
        placeholder="Write your markdown template here..."
      />
    </div>
  </div>
</template>
