// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@vueuse/nuxt', '@nuxt/test-utils/module'],

  typescript: {
    strict: true,
  },

  supabase: {
    // Auth redirect is disabled until auth pages exist
    redirect: false,
    // Point at generated types once a schema exists: supabase gen types ... > types/database.types.ts
    types: false,
  },

  runtimeConfig: {
    // Server-only; set via NUXT_ANTHROPIC_API_KEY
    anthropicApiKey: '',
  },
})
