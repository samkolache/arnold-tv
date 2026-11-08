<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui'

withDefaults(defineProps<PrimitiveProps>(), {
  as: 'div',
})
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    data-slot="card-body"
    class="flex flex-col gap-1 p-3"
  >
    <slot />
  </Primitive>
</template>
