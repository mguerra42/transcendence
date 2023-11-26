<script setup lang="ts">
    const props = defineProps<{
        gameId: string,
        state: any,
    }>();


    let playerLeft = computed(() => {
        return props.state.left || {}
    })
    let playerRight = computed(() => {
        return props.state.right || {}
    })
</script>
<template>
    <div>
        <div class="bg-zinc-700 p-2.5 py-5 gap-5 shadow-lg  hover:bg-zinc-700 w-full cursor-pointer rounded-lg flex flex-col justify-center">

            <nuxt-link :to="{
                name: 'game-game',
                params: {
                    game: gameId
                }
            }" class=" flex justify-center text-lg sm:text-[1.5rem] md:text-3xl lg:text-4xl  font-bold">
                    Game #{{ gameId  }}
            </nuxt-link>
            <div class="flex mt-1 justify-around px-10 gap-5 flex-col sm:flex-row">

                <nuxt-link v-if="playerLeft?.user" :to="{
                    name: '@user',
                    params: {
                        user: playerLeft?.user?.username
                    }
                }" class="flex b-1 rounded p-2.5 w-full justify-center hover:bg-white/20">
                    <div class="flex justify-center">
                        <div class="flex-col flex justify-center">
                            <p class="text-lg text-center text-zinc-200" >{{ playerLeft?.user?.username }}</p>
                            <p class="text-xs text-center text-zinc-400" >W/L : {{playerLeft?.user?.victories}}-{{ playerLeft?.user?.defeats }}</p>
                            <p class="text-xs text-center text-zinc-400" >Elo : {{playerLeft?.user?.points}}</p>
                        </div>
                    </div>
                    <img :src="playerLeft?.user?.avatar" :class="[playerLeft?.user?.online ? 'border-green-400' : 'border-yellow-400']" class="w-30 h-30 m-2 border-8  rounded-full" />
                </nuxt-link>
                <div class="flex flex-col justify-center">
                    <p class="text-zinc-200 ml-5 mr-5 text-7xl font-bold text-center">
                        VS
                    </p>
                </div>
                <nuxt-link v-if="playerRight?.user" :to="{
                    name: '@user',
                    params: {
                        user: playerRight?.user?.username
                    }
                }" class="flex  b-1 rounded p-2.5 w-full justify-center hover:bg-white/20">
                    <img :src="playerRight?.user?.avatar" :class="[playerRight?.user?.online ? 'border-green-400' : 'border-yellow-400']" class="w-30 h-30 m-2 border-8  rounded-full" />
                    <div class="flex justify-center">
                        <div class="flex-col flex justify-center">
                            <p class="text-lg text-center text-zinc-200" >{{ playerRight?.user?.username }}</p>
                            <p class="text-xs text-center text-zinc-400" >W/L : {{playerRight?.user?.victories}}-{{ playerRight?.user?.defeats }}</p>
                            <p class="text-xs text-center text-zinc-400" >Elo : {{playerRight?.user?.points}}</p>
                        </div>
                    </div>
                </nuxt-link>
            </div>
</div>
    </div>
</template>