<script setup lang="ts">
    const auth = useAuth()

  await auth.refreshSession()
</script>
<template>
  <main class="h-100vh">
    <ViewAuth v-if="auth.logged"/>
    <ViewLogin v-else/>
  </main>
</template>