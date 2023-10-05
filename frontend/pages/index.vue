<template>
    <div class="bg-gray flex items-center h-full justify-center flex-col">
      <Pong v-if="auth.logged"/>
    </div>
</template>

<script setup lang="ts">
  const auth = useAuth()
  const client = useClient()

  onMounted(() => {
})
</script>

