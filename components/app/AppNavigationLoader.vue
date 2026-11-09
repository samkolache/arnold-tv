<script setup lang="ts">
import { ProgressRoot } from 'reka-ui'

const SHOW_DELAY_MS = 120

const { isLoading } = useLoadingIndicator({ throttle: 0 })
const visible = ref(false)

const { start, stop } = useTimeoutFn(() => {
  visible.value = true
}, SHOW_DELAY_MS, { immediate: false })

watch(isLoading, (loading) => {
  if (loading) {
    start()
    return
  }
  stop()
  visible.value = false
})
</script>

<template>
  <Transition name="navigation-loader">
    <div
      v-if="visible"
      data-slot="navigation-loader"
      class="fixed inset-0 z-50 flex items-center justify-center bg-inverse/40 backdrop-blur-[2px]"
    >
      <ProgressRoot
        :model-value="null"
        data-slot="navigation-loader-spinner"
        aria-label="Loading page"
        class="size-12 animate-spin rounded-full border-4 border-subtle border-t-action-primary"
      />
    </div>
  </Transition>
</template>

<style scoped>
.navigation-loader-enter-active,
.navigation-loader-leave-active {
  transition: opacity 150ms ease;
}

.navigation-loader-enter-from,
.navigation-loader-leave-to {
  opacity: 0;
}
</style>
