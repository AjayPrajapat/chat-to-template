# Chat-to-Template

A Nuxt 3 application for building Markdown templates that are filled using an AI-powered chat workflow. Users can write Markdown templates with placeholders (e.g. `{{placeholder}}`), converse with an assistant to gather context, and automatically insert the generated answers into the template with live preview and export support.

## Features

- ✏️ Markdown editor with placeholder highlighting
- 💬 Chat workspace integrated with the OpenAI API
- 🧠 Automatic mapping between AI answers and template placeholders
- 🪟 Live Markdown preview and editable placeholder list
- 🔁 Regenerate answers and fine-tune values manually
- 📥 Download the filled Markdown document

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Create a `.env` file at the project root and provide your OpenAI API key:

   ```bash
   OPENAI_API_KEY=sk-...
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open the editor**

   Visit [http://localhost:3000/editor](http://localhost:3000/editor) to start filling templates with AI assistance.

## Project Structure

- `pages/editor.vue` – main workspace combining the editor, placeholders, preview, and chat
- `components/MarkdownEditor.vue` – markdown editor with placeholder highlighting
- `components/ChatBox.vue` – chat interface for interacting with the AI
- `components/PlaceholderList.vue` – editable list of detected placeholders
- `components/PreviewPane.vue` – live rendered Markdown preview
- `server/api/generate.post.ts` – Nuxt server route that calls the OpenAI API
- `composables/useAI.ts` – composable for managing AI requests and state

## Tailwind CSS

Tailwind CSS is configured via `tailwind.config.ts` and `assets/css/tailwind.css`. Adjust the theme or add utilities as needed.

## Example Template

An example template is available at `assets/templates/example.md` and loads automatically when visiting the editor. Modify it or replace with your own template to detect new placeholders instantly.

---

Built with ❤️ using Nuxt 3, Tailwind CSS, and the OpenAI API.
