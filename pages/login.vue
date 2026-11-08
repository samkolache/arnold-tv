<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

const destination = computed(() => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  return redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'
})

async function submit() {
  if (submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    await navigateTo(destination.value, { external: true })
  } catch {
    error.value = 'Incorrect username or password'
    submitting.value = false
  }
}

useHead({ title: 'Sign in' })
</script>

<template>
  <main data-slot="login" class="flex min-h-screen items-center justify-center bg-canvas p-6">
    <form
      data-slot="login-card"
      class="flex w-full max-w-sm flex-col gap-6 rounded-lg border border-subtle bg-raised p-8 shadow-card"
      @submit.prevent="submit"
    >
      <div data-slot="login-header" class="flex flex-col gap-1.5">
        <h1 class="heading-h2 text-primary">Welcome to Arnold TV</h1>
        <p class="body-md text-secondary">Sign in to manage your flyers and TV slideshow.</p>
      </div>

      <div data-slot="login-fields" class="flex flex-col gap-4">
        <UiInput
          v-model="username"
          label="Username"
          name="username"
          autocomplete="username"
          autofocus
          required
        />
        <UiInput
          v-model="password"
          label="Password"
          name="password"
          type="password"
          autocomplete="current-password"
          :error="error"
          required
        />
      </div>

      <UiButton type="submit" size="lg" :loading="submitting" class="w-full">Sign in</UiButton>
    </form>
  </main>
</template>
