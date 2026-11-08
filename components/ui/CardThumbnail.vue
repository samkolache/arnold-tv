<script setup lang="ts">
interface Props {
  src: string
  alt?: string
}

withDefaults(defineProps<Props>(), {
  alt: '',
})
</script>

<template>
  <div data-slot="card-thumbnail" class="aspect-video w-full overflow-hidden bg-sunken">
    <img
      :src="src"
      :alt="alt"
      data-slot="card-thumbnail-image"
      class="size-full object-cover"
    >
  </div>
</template>
