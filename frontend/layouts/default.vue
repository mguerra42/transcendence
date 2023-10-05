<template>
  <main class="h-full">
    <Header/>
    <div class="h-[calc(100vh-80px)] b-1 flex">
        <div class="b-r flex flex-col max-h-[70vh] overflow-y-auto">Sidebar Left
        </div>
        <div class="flex-1 bg-red"><slot />
        </div>
        <div class="b-l">Sidebar Right</div>
      </div>
      <Footer/>
    <AuthModal/>
  </main>
</template>

<script setup lang="ts">
const auth = useAuth()

onMounted(() => {
})
</script>
