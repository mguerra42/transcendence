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
        <div v-else class="">
          <div class="home">
            <!-- Homepage -->
            <div class="video-container">
              <video autoplay loop muted preload="auto">
                <source src="/videos/grid2.mp4" type="video/mp4">
              </video>
            </div>

            <div class="gif-style">
                <img src="/videos/green-pong.gif">
            </div>

            <button class="big-title layers hero glitch neon-text" data-text="WELCOME TO PONG">WELCOME TO PONG</button>
            <section class="term-box" style="width:850px; height:700px;  top:200px; left:50px;">
              <div class="hero-container">
              
                <!-- Liste d'options A GARDER-->
                <!-- <ul class="options-list">
                  <li><button class="home-button layers hero glitch" data-text="-login" @click="changeMode('login')"
                    style="left:-200px; top:-90px;">-login</button>
                  </li>
                  <li><button class="home-button layers hero glitch" data-text="-signup" @click="changeMode('signup')"
                    style="left:-192px; top:-70px;">-signup</button>
                  </li>
                </ul> -->
              </div>
            </section>
            <!-- LoginForm -->
            <div class="term-box" style="width:850px; height:700px; top:200px; right:50px; position:absolute;">
              <AuthLoginForm v-if="auth.mode === 'login'" />
              <AuthSignUpForm v-else />
            </div>
          </div> <!-- <div class="home"></div>-->
      </div>
  
    </main>
  </template>