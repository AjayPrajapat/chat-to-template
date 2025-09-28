<script setup lang="ts">
const props = defineProps<{
  placeholders: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update', payload: { name: string; value: string }): void
}>()

const placeholderExample = '{{name}}'

const handleInput = (name: string, value: string) => {
  emit('update', { name, value })
}
</script>

<template>
  <div class="flex flex-col gap-3 h-full">
    <header>
      <h2 class="text-lg font-semibold text-slate-100">Placeholders</h2>
      <p class="text-sm text-slate-400">Edit generated values before exporting.</p>
    </header>
    <div class="flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <p v-if="!Object.keys(placeholders).length" class="text-sm text-slate-400">
        No placeholders detected. Add placeholders like <code>{{ placeholderExample }}</code> to the template.
      </p>
      <div
        v-for="([name, value], index) in Object.entries(placeholders)"
        :key="name"
        class="rounded-lg border border-slate-800 bg-slate-950/40 p-3"
      >
        <label :for="`placeholder-${index}`" class="text-xs uppercase tracking-wide text-slate-400">{{ name }}</label>
        <textarea
          :id="`placeholder-${index}`"
          :value="value"
          @input="handleInput(name, ($event.target as HTMLTextAreaElement).value)"
          class="mt-2 h-24 w-full resize-y rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
    </div>
  </div>
</template>
