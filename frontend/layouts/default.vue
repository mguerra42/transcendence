<template>
  <main class="h-100vh">
    
    <!-- Logged In View -->
    <div v-if="auth.logged === true" class="overflow-y-auto scrollbar-w-2">
      <Header :gameProps="gameProps" :stateProps="stateProps" />
        <div class="h-[calc(100vh-80px)] flex" >
          
          <!-- Left Sidebar -->
            <!-- <div class="w-0/6 lg:w-300px sm:w-0/6 md:w-0/6 rounded bg-zinc-800 max-h-[100vh] overflow-y-auto scrollbar-w-2"> -->
              <!-- Leaderboard -->
              <!-- <div class="overflow-y-auto scrollbar-w-2 h-[70vh] bg-zinc-900 rounded-lg m-4">
                <p class="text-4xl flex text-center font-bold m-2">
                  Leaderboard
                </p>
              </div>
            </div> -->
          <!-- Left Sidebar -->
          
          <!-- Nuxt Page -->
            <div class="flex-1 w-4/6 bg-red overflow-y-auto scrollbar-w-2">
              <slot />
            </div>
          <!-- Nuxt Page -->
          
          <!-- Right Sidebar -->
          <!-- <div class="w-0/6 sm:w-0/6 lg:w-300px md:w-300px rounded bg-zinc-300 max-h-[100vh] overflow-y-auto scrollbar-w-2">
            <div class="overflow-y-auto scrollbar-w-2 h-[100vh] bg-zinc-900 rounded-lg m-4 flex-col">
              <p class="text-4xl text-white text-center m-2">
                  {{ auth.session.username }}
              </p>
              <p class="text-sm text-white ml-6 m-2">
                total victories &ensp;:&ensp; {{ auth.session.victories }}
                <br>
                total defeats  &emsp;:&ensp; {{ auth.session.defeats }}
              </p> -->

              <!-- Game List -->
              <!-- <div v-for="gameList in client.game.gameArray" :class="{' bg-red-700 cursor-pointer hover:bg-red-600  flex-col mb-3 mt-4' : gameList.loserId === auth.session.id,
                                                                      ' bg-green-700 cursor-pointer hover:bg-green-600  flex-col mb-3 mt-4' : gameList.winnerId === auth.session.id}" >
                   <p class="text-s text-white text-center m-2">
                    game id : {{ gameList.id }} 
                  </p>
                  <p class="text-2xl text-white text-center m-2">
                    {{ gameList.winnerName }} <b>VS</b> {{ gameList.loserName }}
                  </p>
                  <p class="text-3xl text-white text-center m-2">
                    {{ gameList.winnerScore }} - {{ gameList.loserScore }} 
                  </p>
                  
              </div>

            </div>
          </div> -->
          <!-- Right Sidebar -->
          
          <!-- TODO : Remove Chat components from AuthModal -->
          <AuthModal :gameProps="gameProps"/>
        </div>
      <Footer/>
    </div>
    
    <!-- Logged Out View -->
      <div v-else class="h-full rounded-lg flex">
        <div class="min-h-screen w-0/5 lg:w-3/5 md:w-1/2 sm:w-0/5 xs:w-0/5 bg-zinc-300 flex flex-col items-center justify-center">
          <div>
            <p class="text-7xl text-center font-bold text-zinc-600 m-4">transcendence</p>
          </div>
        </div>
        <div class="min-h-screen w-5/5 lg:w-2/5 md:w-1/2 sm:w-5/5 xs:w-5/5 bg-zinc-800 flex flex-col items-center justify-center">
          <div class="">
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
  const auth = useAuth()
  const client = useClient()
  const { stateProps, gameProps } = defineProps<{
      stateProps: any,
      gameProps: any
  }>();

  client.game.gameArray = [];

  //TODO : move this to another place
  onMounted(async() => {
    await auth.refreshSession()
    if (auth.logged)
    {
      client.game.gameArray = await client.game.getGameArray();
    }
  })
</script>
