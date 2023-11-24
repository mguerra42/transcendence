<script setup lang="ts">
    const auth = useAuth()
    const { stateProps, gameProps } = defineProps<{
        stateProps: any,
        gameProps: any
    }>();
  
    onMounted(async() => {
    })

  const changeMode = (mode : string) => {
    auth.showForm = true;
    auth.mode = mode;
    console.log(auth.mode);
  };

  import '/frontend/public/styles/home.css';

</script>


<template>
    <main class="h-100vh">
      
      <!-- Logged In View -->
      <div v-if="auth.logged === true" class="overflow-y-auto scrollbar-w-2">
        <Header :gameProps="gameProps" :stateProps="stateProps" />
          <div class="h-[calc(100vh-80px)] flex" >
            
            <!-- Left Sidebar -->
              <div class="w-0/6 lg:w-300px sm:w-0/6 md:w-0/6 rounded bg-zinc-800 max-h-[100vh] overflow-y-auto scrollbar-w-2">
                <!-- Leaderboard -->
                <div class="overflow-y-auto scrollbar-w-2 h-[70vh] bg-zinc-900 rounded-lg m-4">
                  <p class="text-4xl flex text-center font-bold m-2">
                    Leaderboard
                  </p>
                </div>
              </div>
            <!-- Left Sidebar -->
            
            <!-- Nuxt Page -->
              <div class="flex-1 w-4/6 bg-red overflow-y-auto scrollbar-w-2">
                <slot />
              </div>
            <!-- Nuxt Page -->
            
            <!-- Right Sidebar -->
            <div class="w-0/6 sm:w-0/6 lg:w-300px md:w-300px rounded bg-zinc-800 max-h-[100vh] overflow-y-auto scrollbar-w-2">
              <div class="overflow-y-auto scrollbar-w-2 h-[100vh] bg-zinc-900 rounded-lg m-4">
                <p class="text-4xl text-center m-2">
                    {{ auth.session.username }}
                </p>
              </div>
            </div>
            <!-- Right Sidebar -->
            
            <!-- TODO : Remove Chat components from AuthModal -->
            <AuthModal :gameProps="gameProps"/>
          </div>
        <Footer/>
      </div>
      
      <!-- Logged Out View -->
        <div v-else class="h-full w-full" >
            <!-- Homepage -->
            <div class="h-full w-full video-container">
              <video class="top-0 bottom-0 left-0 right-0" autoplay loop muted preload="auto">
                <source src="/videos/grid2.mp4" type="video/mp4">
              </video>
            </div >

            <div class="relative z-100 flex items-center flex-col gap-5 justify-start w-full h-full py-20 px-5">
              <div class="flex w-full max-w-1900px items-center h-100px">
                <button class="transition-all w-full big-title layers hero glitch neon-text text-3.5rem md:text-5rem lg:text-7rem" data-text="WELCOME TO PONG">WELCOME TO PONG</button>
              </div>
              <div class="grid sm:grid-cols-2 gap-5 max-w-1900px w-full">
                <div class="term-box flex flex-col">
                  <div class="home-font px-6 pt-10 text-5xl mb-6 text-center"> READY TO FIGHT ?</div>
                  <div class="px-5 py-5 flex items-center ">
                    <img class="h-full" src="/videos/green-pong.gif">
                  </div>
                </div>
                <div class="term-box flex" >
                  <AuthLoginForm v-if="auth.mode === 'login'" />
                  <AuthSignUpForm v-else />
                </div>
              </div>
            </div>
            
            </div> <!-- <div class="home"></div>-->
            <!-- <div class="flex items-center flex-col gap-5 justify-center w-full h-full bg-green px-5">
             <div class="">
              <div class="bg-red rounded-full w-200px h-200px"></div>
             </div>
              <div class=" bg-blue max-w-1080px h-100px w-full relative rounded-full b-1">
                div
              </div>
              <div class=" bg-blue max-w-1080px h-250px w-full relative rounded-full b-1">
                div
              </div>
              <div class="grid sm:grid-cols-2 gap-5 h-600px max-w-1080px w-full">
                <div class=" bg-blue ">
                  VIDEO GIF
                </div>
                <div class=" bg-blue ">
                  Login form
                </div>
              </div>
            </div> -->
      <!-- </div> -->
  
    </main>
  </template>