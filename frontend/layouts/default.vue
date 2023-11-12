<script setup lang="ts">
    const auth = useAuth()
    await auth.getSession()

</script>
<template>
  <main class="h-100vh">
      <ViewLogin v-if="auth.showLoginView"/>
      <div v-else class="flex flex-col h-full relative">
        <Header/>
        <div class="flex h-full">
            <aside class="w-240px bg-blue h-full">Sidebar left</aside>
            <section class="flex-1 w-full">
                <slot/>
            </section>
            <aside class="w-240px bg-green h-full">Sidebar right</aside>
        </div>
        <ChatModule/>
    </div>
        <notifications position="bottom center" :pauseOnHover="true" />
  </main>
</template>
<style scoped>
.vue-notification-group {
    z-index: 10000;
    z-index: 99999;
    bottom: 15px !important;
}
</style>
