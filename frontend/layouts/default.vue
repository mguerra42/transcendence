<template>
  <main class="h-100vh overflow-y-auto scrollbar-w-2">
    
    <!-- Logged In View -->
    <div v-if="auth.logged === true">
      <Header :gameProps="gameProps" :stateProps="stateProps" />
        <div class="h-[calc(100vh-80px)] flex" >
          
          <!-- Left Sidebar -->
            <div class="w-1/6 rounded bg-zinc-800 max-h-[100vh] overflow-y-auto scrollbar-w-2">
              <!-- Leaderboard -->
              <div class="overflow-y-auto scrollbar-w-2 h-[70vh] flex justify-center bg-zinc-900 rounded-lg m-4">
                <p class="text-4xl text-center font-bold m-2">
                  Leaderboard
                </p>
              </div>
            </div>
          <!-- Left Sidebar -->
          
          <!-- Nuxt Page -->
            <div class="flex-1 w-4/6 bg-red">
              <slot />
            </div>
          <!-- Nuxt Page -->
          
          <!-- Right Sidebar -->
          <div class="w-1/6 rounded bg-zinc-800 max-h-[100vh] overflow-y-auto scrollbar-w-2">
            <div class="overflow-y-auto scrollbar-w-2 h-[100vh] bg-zinc-900 rounded-lg m-4">
              <p class="text-4xl text-center m-2">
                  {{ auth.session.username }}
              </p>
            </div>
          </div>
          <!-- Right Sidebar -->
          
          <AuthModal/>
        </div>
        <Footer/>
    </div>
    
    <!-- Logged Out View -->
      <div v-else class="h-full rounded-lg flex">
        <div class="min-h-screen w-3/4 bg-zinc-300 flex flex-col items-center justify-center">
          <div>
            <p class="text-7xl text-center font-bold text-zinc-600 m-4">transcendence</p>
          </div>
        </div>
        <div class="min-h-screen w-1/4 bg-zinc-800 flex flex-col items-center justify-center">
          <div class="flex justify-center">
            <AuthLoginForm v-if="auth.mode === 'login'" />
            <AuthSignUpForm v-else />
          </div>
        </div>
      </div>

  </main>
</template>

<style>
  .scrollbar-w-2::-webkit-scrollbar {
    width: 0rem;
  }
</style>

<script setup lang="ts">
import LoginForm from '~/components/Auth/LoginForm.vue';

  const auth = useAuth()

  const { stateProps, gameProps } = defineProps<{
      stateProps: any,
      gameProps: any
  }>();

  onMounted(() => {
    // test.printTest()
  })
</script>
