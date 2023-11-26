<script setup lang="ts">
    const route = useRoute()
    const socket = useSocket()

    const profile = ref({
        id: '',
    })
    onMounted(() => {
        console.log('onMounted: Profile.vue')
        socket.emit('profile', route.params.user, (data) => {
            console.log('profile: ', data)
            profile.value = data
        })
    })
</script>
<template>
    <div class="flex flex-col items-center  h-full" v-if="profile?.id">
        <div class="flex-1 w-full h-full max-w-5xl flex flex-col gap-5">
        <div class="mt-10 font-bold text-5xl">
            Profile of {{ profile.username }}
        </div>
        <div class="bg-zinc-800 rounded-lg p-2.5 text-3x flex flex-col items-center">
            <ChatUserAvatar size="h-24 w-24 " :userId="profile.id" :avatar="profile.avatar" />
            <div class="text-2xl font-bold">
                {{ profile.username }}
            </div>
            <div class="text-xl">
                {{ profile.email }}
            </div>
            <div class="text-xl">
                {{ profile.points }} ELO
            </div>
            <div class="flex flex-wrap justify-center gap-5 b-y-1 mb-5 w-full">
          <div class="flex items-center justify-center flex-col">
            <div class="font-bold text-2xl">{{ profile.victories }}</div>
            <div>Victories</div>
          </div>
          <div class="flex items-center justify-center flex-col">
            <div class="font-bold text-2xl">{{ profile.defeats }}</div>
            <div>Defeats</div>
          </div>
        </div>
        <!--{{ profile }}-->
     <div v-if="profile.currentGame" class="my-5">

         <div class="text-3xl mb-5">Currently Playing</div>
         <div class="b-1 rounded p-2.5">
             
             <PongBanner :gameId="profile.currentGame.id" :state="profile.currentGame.state" />
            </div>
        </div>
     <div v-if="profile.gameHistory" class="my-5 w-full">

         <div class="text-3xl mb-5">History</div>
         <div class="b-1 rounded p-2.5 w-full">
             <div class="grid grid-cols-3">
                    <div class="text-xl font-bold">Winner</div>
                    <div class="text-xl font-bold">Loser</div>
                    <div class="text-xl font-bold">Score</div>
             </div>
             <PongHistory v-for="game in profile.gameHistory"  :game="game" />
            </div>
        </div>
    </div>
    </div>
    </div>
</template>