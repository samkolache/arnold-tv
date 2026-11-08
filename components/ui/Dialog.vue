<script setup lang="ts">
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

type Size = 'sm' | 'md'

interface Props {
  title: string
  description?: string
  size?: Size
}

withDefaults(defineProps<Props>(), { size: 'md' })

const sizes: Record<Size, string> = {
  sm: 'w-[480px]',
  md: 'w-[720px]',
}

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay data-slot="dialog-overlay" class="fixed inset-0 z-40 bg-inverse/60" />
      <DialogContent
        data-slot="dialog-content"
        :data-size="size"
        :class="sizes[size]"
        class="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-4rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-[22px] overflow-y-auto rounded-lg bg-raised p-8 shadow-card focus:outline-none"
      >
        <header data-slot="dialog-header" class="flex flex-col gap-1.5">
          <DialogTitle data-slot="dialog-title" class="heading-h1 text-primary">{{ title }}</DialogTitle>
          <DialogDescription v-if="description" data-slot="dialog-description" class="body-md text-secondary">
            {{ description }}
          </DialogDescription>
        </header>

        <slot />

        <footer v-if="$slots.actions" data-slot="dialog-actions" class="flex justify-end gap-3">
          <slot name="actions" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
