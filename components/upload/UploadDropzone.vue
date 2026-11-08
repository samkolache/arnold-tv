<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUp } from 'lucide-vue-next'

interface Props {
  accept: string[]
  maxBytes: number
  title?: string
  buttonLabel?: string
  hints?: string[]
  error?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Drop your flyer here',
  buttonLabel: 'Choose a file',
  hints: () => [],
  error: null,
  disabled: false,
})

const emit = defineEmits<{
  select: [file: File]
  invalid: [message: string]
}>()

const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

function pick(file: File | undefined) {
  if (!file || props.disabled) return

  if (!props.accept.includes(file.type)) {
    emit('invalid', "That file type isn't supported. Try a JPG, PNG or WebP image.")
    return
  }
  if (file.size > props.maxBytes) {
    emit('invalid', `That file is too big. The limit is ${props.maxBytes / 1024 / 1024} MB.`)
    return
  }

  emit('select', file)
}

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  pick(target.files?.[0])
  target.value = ''
}

function onDragOver() {
  if (!props.disabled) dragging.value = true
}

function onDragLeave(event: DragEvent) {
  const zone = event.currentTarget as HTMLElement
  if (!zone.contains(event.relatedTarget as Node | null)) dragging.value = false
}

function onDrop(event: DragEvent) {
  dragging.value = false
  pick(event.dataTransfer?.files[0])
}
</script>

<template>
  <div data-slot="upload-dropzone" class="flex w-full flex-col gap-4">
    <div
      data-slot="upload-dropzone-area"
      :data-dragging="dragging || undefined"
      :data-disabled="disabled || undefined"
      class="flex flex-col items-center justify-center gap-4 rounded-lg border-[1.5px] border-dashed border-strong bg-raised px-6 py-14 transition-colors
             data-[dragging]:border-action-primary data-[dragging]:bg-action-subtle-hover
             data-[disabled]:opacity-60"
      @dragenter.prevent="onDragOver"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <span
        data-slot="upload-dropzone-icon"
        class="flex size-16 items-center justify-center rounded-full bg-sunken text-primary"
        aria-hidden="true"
      >
        <ArrowUp class="size-6" :stroke-width="2.5" />
      </span>

      <p data-slot="upload-dropzone-title" class="heading-h2 text-primary">{{ title }}</p>

      <UiButton data-slot="upload-dropzone-button" :disabled="disabled" @click="input?.click()">
        {{ buttonLabel }}
      </UiButton>

      <input
        ref="input"
        data-slot="upload-dropzone-input"
        type="file"
        class="sr-only"
        tabindex="-1"
        :accept="accept.join(',')"
        :disabled="disabled"
        @change="onChange"
      >

      <ul v-if="hints.length" data-slot="upload-dropzone-hints" class="flex flex-wrap justify-center gap-2">
        <li
          v-for="hint in hints"
          :key="hint"
          data-slot="upload-dropzone-hint"
          class="caption rounded-full bg-surface px-3 py-1.5 text-secondary"
        >
          {{ hint }}
        </li>
      </ul>
    </div>

    <p
      v-if="error"
      data-slot="upload-dropzone-error"
      role="alert"
      class="body-sm rounded-md bg-status-error-bg px-4 py-3 text-status-error-text"
    >
      {{ error }}
    </p>
  </div>
</template>
