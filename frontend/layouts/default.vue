<script setup lang="ts">
import slugify from 'slugify'

const auth = useAuth();
const avatarFile = ref(null);
const onFileSelected = async (event: any) => {
    avatarFile.value = event.target.files[0]
}
const avatarPreview = computed(() => {
    return avatarFile.value ? URL.createObjectURL(avatarFile.value) : auth.session.avatar
})

const debounce = (func: any, wait: any, immediate: any) => {
    let timeout: any;
    return function() {
        let context = this, args = arguments;
        let later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args)
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context,args)
    }
}

const onInput = debounce((event: any) => {
    auth.session.username = slugify(event.target.value, {
        replacement: '_',
        lower: true,
        strict: true
    })
}, 400, false)
await auth.getSession();
</script>
<template>
  <main class="h-100vh">
    <div v-if="auth.showLoginView" class="h-full rounded-lg flex">
        <div
            class="min-h-screen w-0/5 lg:w-3/5 md:w-1/2 sm:w-0/5 xs:w-0/5 bg-zinc-300 flex flex-col items-center justify-center">
            <div>
                <p class="text-5xl lg:text-7xl text-center font-bold text-zinc-600 m-4">Transcendence</p>
            </div>
        </div>
        <div class="min-h-screen w-5/5 lg:w-2/5 md:w-1/2 sm:w-5/5 xs:w-5/5 bg-zinc-800 flex flex-col items-center justify-center">{{ auth }}
            <Auth2FAForm v-if="auth.need2FA" />
            <AuthLoginForm v-else-if="auth.activeForm === 'login'" />
            <AuthSignUpForm v-else-if="auth.activeForm === 'signup'" />
        </div>
    </div>
    <div v-else-if="auth.isSetup == false" class="h-full rounded-lg flex items-center justify-center">
        <div class="bg-slate-700 rounded py-3 px-5">
            <div class="font-bold text-2xl">Setup your account</div>
            <div class="font-bold text-base">Choose a username</div>
            <div class="flex flex-col">
                <input type="text" @input="onInput" v-model="auth.session.username" class="rounded-lg px-3 py-2 text-black b-1" />
            </div>
            <div class="font-bold text-base mt-4">Change your profile picture (optional)</div>
            <div class="flex justify-center">
                <img :src="avatarPreview" class="rounded-lg mt-4 h-100px max-w-100px b-2 b-white p-.5" />
            </div>
            <div class="flex items-center">
                <input type="file" accept="image/jpeg,image/png" ref="fileInput"  @change="onFileSelected"  />
            </div>
            <div>
                <button class="bg-blue-500 hover:bg-blue-600 w-full transition duration-300 rounded-lg px-4 py-2 mt-4" @click="auth.setup({
                    username: auth.session.username,
                    avatar: avatarFile
                })">Setup</button>
            </div>
        </div>
    </div>
    <div v-else class="flex flex-col h-full relative">
      <Header />
      <div class="flex h-full">
        <!--<aside class="w-240px bg-blue h-full">Sidebar left</aside>-->
        <section class="flex-1 w-full">
          <slot />
        </section>
        <!--<aside class="w-240px bg-green h-full">Sidebar right</aside>-->
      </div>
      <!--<ChatModule />-->
    </div>
    <notifications position="bottom center" :pauseOnHover="true" />
  </main>
</template>
<style scoped>
.vue-notification-group {
  z-index: 10000;
  z-index: 99999;
  bottom: 15px !important;
}
</style>
