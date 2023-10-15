<script setup lang="ts">
  import { appName } from '~/constants'

  const isLoading = ref(true);  
  //Global Prop Test
  // const test = {
  //   printTest: () => {
  //     console.log('test');
  //   },
  // }

  useHead({
    title: appName,
  })
  // Display the loader before the component is mounted
  onBeforeMount(() => {
    isLoading.value = true;
  });
  onMounted(() => {
    isLoading.value = false;
  });
</script>

<template>
  <div>
    <transition name="fade" mode="out-in">
      <div v-if="isLoading" key="loading" class="min-h-screen bg-zinc-800 flex flex-col items-center justify-center">
        <div>
          <p class="text-7xl text-center font-bold text-zinc-200 m-4">transcendence</p>
          <p class="text-xl text-center text-zinc-400 mb-4">Loading...</p>
        </div>
        <div class="flex justify-center items-center animate-bounce h-[12px] w-[12px] bg-zinc-200 rounded-full"></div>
      </div>
    </transition>
    <div v-if="!isLoading" key="content">
      <!-- <NuxtLayout :test="test"> -->
      <NuxtLayout>
        <NuxtPage/>
      </NuxtLayout>
    </div>
  </div>
</template>

<style>
  /* Define the fade transition */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }

  /* Rest of your styles */
  html, body, #__nuxt {
    height: 100vh;
    margin: 0;
    padding: 0;
  }

  html.dark {
    background: #000;
    color: white;
  }
</style>
