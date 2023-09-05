<script setup lang="ts">
const auth = useAuth()
</script>

<template>
  <div v-if="auth.showForm" class="absolute top-0 bottom-0 left-0 right-0 z-10 flex justify-center items-center bg-black/60 backdrop-blur-sm" >
    <AuthLoginForm v-if="auth.mode === 'login'" />
    <AuthSignUpForm v-else />
  </div>
</template>
