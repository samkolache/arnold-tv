<template>
  <div class="grid min-h-screen grid-cols-[15rem_1fr] max-lg:flex max-lg:flex-col">
    <AppSidebar />
    <main class="p-8 max-lg:p-6 max-sm:p-4">
      <slot />
    </main>
  </div>
</template>
