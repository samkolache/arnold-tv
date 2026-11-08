<script setup lang="ts">
import { ref, watch } from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'

interface Props {
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
})

const emit = defineEmits<{ submit: [feedback: string] }>()

const open = defineModel<boolean>('open', { default: false })
const feedback = ref('')

watch(open, (isOpen) => {
  if (!isOpen && !props.loading) feedback.value = ''
})

function submit() {
  const text = feedback.value.trim()
  if (text && !props.loading) emit('submit', text)
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <UiButton
        variant="ghost"
        size="sm"
        aria-label="Regenerate slides"
        title="Regenerate"
        data-slot="flyer-regenerate-trigger"
        class="border border-subtle"
      >
        <RotateCcw class="size-4" aria-hidden="true" />
      </UiButton>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        side="top"
        align="end"
        :side-offset="8"
        data-slot="flyer-regenerate-content"
        class="z-50 flex w-80 flex-col gap-3 rounded-md bg-raised p-4 shadow-card focus-visible:outline-none"
        @interact-outside="loading && $event.preventDefault()"
      >
        <label for="flyer-regenerate-feedback" class="label-field text-primary">What should change?</label>
        <textarea
          id="flyer-regenerate-feedback"
          v-model="feedback"
          data-slot="flyer-regenerate-feedback"
          rows="4"
          maxlength="500"
          :disabled="loading"
          placeholder="e.g. Put Boxing and Kickboxing on separate slides"
          class="body-sm w-full resize-none rounded-md border border-subtle bg-raised p-3 text-primary transition-colors placeholder:text-disabled hover:border-strong focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus disabled:bg-action-disabled disabled:text-disabled"
          @keydown.meta.enter.prevent="submit"
          @keydown.ctrl.enter.prevent="submit"
        />
        <p class="caption text-secondary">AI reads the flyer again and makes new slides from your note.</p>

        <p v-if="error" role="alert" data-slot="flyer-regenerate-error" class="body-sm rounded-md bg-status-error-bg p-3 text-status-error-text">
          {{ error }}
        </p>

        <UiButton size="sm" class="self-end" :loading="loading" :disabled="!feedback.trim()" @click="submit">
          <RotateCcw class="size-4" aria-hidden="true" />
          Regenerate
        </UiButton>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
