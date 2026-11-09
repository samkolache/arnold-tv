<script setup lang="ts">
import type { Component } from 'vue'
import { File, Home, Settings, ExternalLink } from 'lucide-vue-next'

interface NavItem {
  label: string
  icon: Component
  to?: string
}

const navItems: NavItem[] = [
  { label: 'Home', icon: Home, to: '/' },
  { label: 'Flyers', icon: File, to: '/flyers' },
]

const { data: organization } = useOrganization()

const route = useRoute()
const NuxtLink = resolveComponent('NuxtLink')

function isActive(item: NavItem) {
  if (!item.to) return false
  if (item.to === '/') return route.path === '/'
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}
</script>

<template>
  <aside class="border-r border-subtle bg-surface p-4 flex flex-col justify-between max-lg:sticky max-lg:top-0 max-lg:z-30 max-lg:flex-row max-lg:items-center max-lg:gap-3 max-lg:border-b max-lg:border-r-0 max-lg:px-4 max-lg:py-3">
    <div class="max-lg:flex max-lg:min-w-0 max-lg:items-center max-lg:gap-4">
      <div class="flex items-center gap-2 mb-6 max-lg:mb-0 max-lg:min-w-0">
        <UiAvatar :name="organization?.name ?? ''" :src="organization?.logo ?? undefined" size="md" />
        <span class="text-lg font-bold max-lg:truncate max-sm:hidden">{{ organization?.name }}</span>
      </div>
      <nav>
        <ul class="flex flex-col gap-1 max-lg:flex-row">
          <li v-for="item in navItems" :key="item.label">
            <component
              :is="item.to ? NuxtLink : 'div'"
              :to="item.to"
              :aria-current="isActive(item) ? 'page' : undefined"
              class="flex items-center gap-3 rounded-md px-3 py-2 transition-colors max-lg:gap-2"
              :class="isActive(item)
                ? 'bg-action-primary/10 text-action-primary font-bold'
                : 'text-primary hover:bg-action-subtle-hover'"
            >
              <component :is="item.icon" class="size-5" />
              <span>{{ item.label }}</span>
            </component>
          </li>
        </ul>
      </nav>
    </div>

    <div class="flex flex-col gap-4 max-lg:shrink-0">
      <UiButton variant="ghost" class="w-full max-lg:w-auto" :as="NuxtLink" to="/slideshow" target="_blank">
        <span class="max-sm:sr-only">Open TV player</span>
        <ExternalLink class="size-5" />
      </UiButton>
      <div class="flex flex-col max-lg:hidden">
        <span>Front desk</span>
        <span class="text-secondary text-sm">Staff</span>
      </div>
    </div>
  </aside>
</template>
