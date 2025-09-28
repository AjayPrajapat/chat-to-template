import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['@/assets/css/tailwind.css'],
  modules: [],
  typescript: {
    strict: true,
    typeCheck: true
  },
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    public: {
      // no public config required for now
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
})
