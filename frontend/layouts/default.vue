<script setup lang="ts">
    const auth = useAuth()
    await auth.refreshSession()

</script>
<template>
  <main class="h-100vh">
      <ViewLogin v-if="!auth.logged"/>
      <div v-else class="flex flex-col h-full relative">
        <Header/>
        <div class="flex h-full">
            <aside class="w-240px bg-blue h-full">Sidebar left</aside>
            <section class="flex-1 w-full">
                <slot/>
            </section>
            <aside class="w-240px bg-green h-full">Sidebar right</aside>
        </div>
        <ChatContainer/>
    </div>
  </main>
</template>