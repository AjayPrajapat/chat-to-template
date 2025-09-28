# Chat-to-Template: AI Coding Instructions

This is a Nuxt 3 application that enables users to create Markdown templates with placeholders (`{{name}}`) and fill them using an AI-powered chat interface.

## Architecture Overview

**Key Pattern**: Template Processing Pipeline
- `MarkdownEditor.vue` captures templates with `{{placeholder}}` syntax
- `pages/editor.vue` extracts placeholders using regex and manages state
- `ChatBox.vue` handles user conversations 
- `server/api/generate.post.ts` sends context to OpenAI to generate placeholder values
- `composables/useAI.ts` manages API calls and error handling
- `PlaceholderList.vue` allows manual editing of generated values
- `PreviewPane.vue` renders final Markdown with placeholders filled

## Critical Development Workflows

**Environment Setup**:
```bash
npm install
# Create .env with: OPENAI_API_KEY=sk-...
npm run dev
# Main workspace: http://localhost:3000/editor
```

**API Integration Pattern**:
- OpenAI API key configured in `nuxt.config.ts` via `runtimeConfig.openaiApiKey`
- API calls use `$fetch('/api/generate', { method: 'POST', body: {...} })`
- Error handling expects `{ statusMessage }` format from Nuxt server errors

## Component Conventions

**Vue 3 Composition API**: All components use `<script setup>` with TypeScript
- Props: `defineProps<{ modelValue: string }>()` pattern
- Events: `defineEmits<{ (e: 'update:modelValue', value: string): void }>()`
- Refs: Explicit typing with `ref<HTMLElement | null>(null)`

**State Management Pattern**:
- Reactive placeholder extraction: `computed(() => template.value.match(/\{\{(.*?)\}\}/g))`
- Watcher synchronization between placeholder names and values
- Cross-component communication via props/events (no global state)

**Styling Approach**:
- Tailwind CSS with custom primary color (`#2563eb`)
- Dark theme with slate color palette (`slate-900`, `slate-800`, etc.)
- Typography plugin for markdown rendering
- Responsive grid layouts for editor workspace

## OpenAI Integration Specifics

**Server Route Pattern** (`server/api/generate.post.ts`):
- Uses `OpenAI` client with `responses.create()` method (not chat completions)
- Structured prompt includes template, existing values, and conversation history
- System message enforces JSON-only responses
- Error handling for missing API key and malformed requests

**Prompt Structure**:
```
Fill the following placeholders based on user input.
Template: [template content]
Existing values: [JSON object]
User context: [formatted conversation]
Return valid JSON with placeholder names as keys.
```

## File Organization

**Components**: Single-responsibility Vue components in `/components/`
**Pages**: Route-based pages in `/pages/` (editor.vue is main workspace)
**Server**: API routes in `/server/api/` using Nuxt's server engine
**Composables**: Reusable logic in `/composables/` (useAI.ts for API management)
**Assets**: Static files including example templates in `/assets/templates/`

## Key Development Notes

- Placeholder regex: `/\{\{(.*?)\}\}/g` for extraction and replacement
- Message ID generation uses `crypto.randomUUID()` with fallback
- Textarea/overlay synchronization for syntax highlighting in editor
- Download functionality creates blob URLs for Markdown export
- TypeScript strict mode enabled with type checking