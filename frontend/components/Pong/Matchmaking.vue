<template>
    <!-- Matchmaking windows -->
    <!-- Loading animation-->
    <div v-if="containerProps.showLoader.value" class="w-50">
        <div class="bg-zinc-700 rounded py-4 px-2">
            <div v-if="!containerProps.showMatchmakingError.value">
                <div class="flex justify-center mx-auto">
                    <div class="animate-bounce h-[16px] w-[16px] bg-zinc-200 rounded-full" v-if="containerProps.showLoader.value"></div>
                </div>
                <div class="bg-zinc-200 h-1 w-10 m-2 mx-auto rounded"></div>
                <p class="text-xs text-zinc-400 text-center">Waiting for an opponent...</p>
                <p class="text-xs text-zinc-400 text-center">00:0{{ containerProps.timeElapsed.value }}</p>
            </div>
            <div v-else class="flex justify-center">
                <p class="text-xs text-zinc-200 text-center">{{ containerProps.MatchmakingError.value }}</p>
            </div>
        </div>
    </div>
    <!-- Accept match window-->
    <div v-if="containerProps.showMatchFound.value" @click="acceptMatch" class="bg-zinc-600 shadow-lg hover:bg-zinc-700 w-140 h-70 cursor-pointer rounded-lg flex flex-col justify-center">
        <p class="text-zinc-200 m-4 text-5xl font-bold text-center">
            Match found !
        </p>
        <div class="flex mt-1 justify-center">
            <div class="flex">
                <div class="flex justify-center">
                    <div class="flex-col flex justify-center">
                        <p class="text-lg text-center text-zinc-200" >{{ containerProps.auth.session.username }}</p>
                        <p class="text-xs text-center text-zinc-400" >W/L : 10-3</p>
                        <p class="text-xs text-center text-zinc-400" >Elo : 1230</p>
                    </div>
                </div>
                <img :src="containerProps.auth.session.avatarPath" class="w-30 h-30 m-2 border-8 border-zinc-100 rounded-full" />
            </div>
            <div class="flex flex-col justify-center">
                <p class="text-zinc-200 ml-5 mr-5 text-7xl font-bold text-center">
                    VS
                </p>
            </div>
            <div class="flex">
                <img :src="containerProps.opponentProfile.value.avatarPath" class="w-30 h-30 m-2 border-8 border-zinc-100 rounded-full" />
                <div class="flex justify-center">
                    <div class="flex-col flex justify-center">
                        <p class="text-lg text-center text-zinc-200" >{{ containerProps.opponentProfile.value.username }}</p>
                        <p class="text-xs text-center text-zinc-400" >W/L : 10-3</p>
                        <p class="text-xs text-center text-zinc-400" >Elo : 1230</p>
                    </div>
                </div>
            </div>
        </div>
        <p class="text-2xl font-bold text-zinc-200 mb-4 mt-4 text-center">
            {{ containerProps.timeElapsed.value }}
        </p>
    </div>
    <!-- Decline button -->
    <div v-if="containerProps.showMatchFound.value" @click="declineMatch" class="bg-zinc-600 w-40 hover:bg-zinc-700 px-2 py-1 m-2 cursor-pointer rounded-lg">
        <p class="text-zinc-200 text-center">
            Decline
        </p>
    </div>
</template>

<script setup lang="ts">
    const acceptMatch = () => {
        containerProps.matchAccepted.value = true;
        containerProps.socket.emit('matchmakingConfirm', {player: containerProps.auth.session.username, confirm: 'accept'})
    }

    const declineMatch = () => {
        containerProps.matchDeclined.value = true;
        containerProps.socket.emit('matchmakingConfirm', {player: containerProps.auth.session.username, confirm: 'decline'})
    }

    const { containerProps } = defineProps<{
            containerProps: any;
    }>();
</script>