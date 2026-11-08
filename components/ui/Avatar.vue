<script setup lang="ts">
import { computed } from 'vue'
import { AvatarRoot, AvatarImage, AvatarFallback } from 'reka-ui'

type Size = 'sm' | 'md' | 'lg'

interface Props {
  name: string
  src?: string
  size?: Size
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizes: Record<Size, string> = {
  sm: 'size-8 text-sm',
  md: 'size-10 text-base',
  lg: 'size-14 text-xl',
}

const initial = computed(() => props.name.trim().charAt(0).toUpperCase())
</script>

<template>
  <AvatarRoot
    data-slot="avatar"
    :data-size="size"
    :class="[
      'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full',
      sizes[size],
    ]"
  >
    <AvatarImage
      v-if="src"
      data-slot="avatar-image"
      :src="src"
      :alt="name"
      class="size-full object-cover"
    />
    <AvatarFallback
      data-slot="avatar-fallback"
      class="flex size-full items-center justify-center bg-action-soft font-display font-bold text-action-primary"
    >
      {{ initial }}
    </AvatarFallback>
  </AvatarRoot>
</template>
