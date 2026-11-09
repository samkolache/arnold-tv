<script setup lang="ts">
import type { Flyer, FlyerStatus } from '~/types/flyer'

definePageMeta({ layout: 'dashboard' })

const NuxtLink = resolveComponent('NuxtLink')

interface Section {
  status: FlyerStatus
  heading: string
}

const sections: Section[] = [
  { status: 'live', heading: 'On the TV now' },
  { status: 'scheduled', heading: 'Scheduled' },
  { status: 'paused', heading: 'Paused' },
]

const [
  { data: organization, error: organizationError },
  { data: flyers, error: flyersError },
] = await Promise.all([useOrganization(), useFlyers()])

const loadError = computed(() => organizationError.value ?? flyersError.value)

const { setPaused, duplicate, remove } = useFlyerActions()
const actionError = ref<string | null>(null)

const flyerToDelete = ref<Flyer | null>(null)
const deleteOpen = ref(false)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

function confirmDelete(flyer: Flyer) {
  flyerToDelete.value = flyer
  deleteError.value = null
  deleteOpen.value = true
}

async function deleteFlyer() {
  if (!flyerToDelete.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await remove(flyerToDelete.value)
    deleteOpen.value = false
  } catch (error) {
    deleteError.value = apiErrorMessage(error, "Couldn't delete this flyer")
  } finally {
    deleting.value = false
  }
}

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) })

const flyersByStatus = computed(() => {
  const timezone = organization.value?.timezone ?? 'UTC'
  const groups: Record<FlyerStatus, { flyer: Flyer, status: FlyerStatus }[]> = {
    live: [],
    scheduled: [],
    paused: [],
    ended: [],
  }

  for (const flyer of flyers.value) {
    const status = getFlyerStatus(flyer, timezone, now.value)
    groups[status].push({ flyer, status })
  }

  return groups
})

const visibleSections = computed(() =>
  sections.filter((section) => section.status === 'live' || flyersByStatus.value[section.status].length > 0),
)

async function run(action: () => Promise<void>) {
  actionError.value = null
  try {
    await action()
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : 'Something went wrong'
  }
}
</script>

<template>
  <div class="space-y-8">
    <header class="flex items-start justify-between max-lg:gap-4">
      <h1 class="heading-h1">Flyers</h1>
      <UiButton :as="NuxtLink" to="/flyers/new">+ New flyer</UiButton>
    </header>

    <p v-if="loadError" class="body-sm text-secondary">
      Couldn't load flyers: {{ loadError.statusMessage ?? loadError.message }}
    </p>
    <p v-if="actionError" class="body-sm text-secondary">
      {{ actionError }}
    </p>

    <section v-for="section in visibleSections" :key="section.status" class="space-y-4">
      <h2 class="heading-h2">{{ section.heading }} · {{ flyersByStatus[section.status].length }}</h2>
      <div v-if="flyersByStatus[section.status].length" class="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <DashboardFlyerCard
          v-for="{ flyer, status } in flyersByStatus[section.status]"
          :key="flyer.id"
          :flyer="toFlyerPreview(flyer)"
          :status="describeFlyerStatus(flyer, status)"
          :scans="status === 'scheduled' ? undefined : flyer.qrScans"
          :paused="flyer.paused"
          @pause="run(() => setPaused(flyer, true))"
          @resume="run(() => setPaused(flyer, false))"
          @duplicate="run(() => duplicate(flyer))"
          @edit="navigateTo(`/flyers/${flyer.id}/edit`)"
          @delete="confirmDelete(flyer)"
        />
      </div>
      <p v-else class="caption text-secondary">Nothing is playing on the TV right now.</p>
    </section>

    <UiDialog
      v-model:open="deleteOpen"
      size="sm"
      :title="`Delete ${flyerToDelete?.title ?? 'flyer'}?`"
      description="Its slides come off the TV right away, and its QR scan and sign-up history is deleted too. This can't be undone."
    >
      <p v-if="deleteError" role="alert" class="body-sm rounded-md bg-status-error-bg p-3 text-status-error-text">
        {{ deleteError }}
      </p>

      <template #actions>
        <UiButton variant="secondary" :disabled="deleting" @click="deleteOpen = false">Cancel</UiButton>
        <UiButton variant="danger" :loading="deleting" @click="deleteFlyer">Delete flyer</UiButton>
      </template>
    </UiDialog>
  </div>
</template>
