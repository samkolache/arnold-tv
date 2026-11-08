// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@vueuse/nuxt',
    'reka-ui/nuxt',
    '@nuxt/test-utils/module',
    '@nuxt/fonts',
    '@nuxt/icon',
  ],

  typescript: {
    strict: true,
  },

  fonts: {
    families: [
      {name: 'Montserrat', weights: [600,700]},
      {name: 'Source Sans 3', weights: [400,600]}
    ]
  },

  supabase: {
    
    redirect: false,
    types: false,
  },

  runtimeConfig: {
    anthropicApiKey: '',
    basicAuthUser: '',
    basicAuthPassword: '',
    public: {
      organizationSlug: '',
    },
  },
})