<script setup lang="ts">
const auth = useAuth()
const friend = useFriend()
const socket = useSocket()
const client = useClient()
const buttonClass = ref('b-1 rounded bg-zinc-500 px-2 py-1 b-zinc-700 cursor-pointer hover:bg-zinc-600');



const { stateProps, gameProps } = defineProps<{
    stateProps: any,
    gameProps: any
}>();

const gameLobby = ref("")

const abortMatch = () => {
    stateProps.matchDeclined.value = true;
    socket.emit('abortMatch', {
        player: auth.session.username,
        senderSocketId: auth.session.socketId,
        //receiverSocketId: stateProps.opponentProfile.value.socketId
    })
}

const startGame = async () => {
    const player = auth.session;
    if (stateProps.showPong.value === false) {
        const ret = await stateProps.waitForMatch();
        //Couldnt find a match
        if (ret === null)
        {
            stateProps.showLoader.value = false;
            await client.game.removeFromGameQueue(auth.session.username)
            stateProps.resetMatchmakingWindow()
            stateProps.showPlayButton.value = true;
            return ;
        }

        await stateProps.waitForConfirm();
        if (stateProps.matchAccepted.value === true && stateProps.opponentAccepted.value === true)
        {
            console.log("gamelobby : ", stateProps.gameLobbyId.value);
            await client.game.getNormalQueuePlayers();
            stateProps.showPong.value = true;
            stateProps.showPlayButton.value = true;
            stateProps.resetMatchmakingWindow()
            gameProps.set();
            gameProps.gameLoop();
            await client.game.setQueueStatus(auth.session.username, 'in-game')
        }
        else
        {
            stateProps.showPlayButton.value = true;
            stateProps.resetMatchmakingWindow()
            await client.game.removeFromGameQueue(auth.session.username)
        }
        //Match non confirmed
    }
    //Exit running game
    else 
    {
        abortMatch();
        gameProps.resetGame();
        cancelAnimationFrame(stateProps.animationFrameId.value);
        await client.game.removeFromGameQueue(gameProps.Player1.value.name)
        await client.game.removeFromGameQueue(gameProps.Player2.value.name)
        await client.game.deleteLobbyById(stateProps.gameLobbyId.value)
        stateProps.showPong.value = false;
        stateProps.showPlayButton.value = true;
        stateProps.resetMatchmakingWindow()
        
    }
}


onMounted(async () => {
    await auth.refreshSession()
})

</script>

<template>
    <div class="h-62px">
        <div class="container mx-auto justify-between h-full flex items-center px-5">
            <div>
                Ft_transcendence
            </div>
            <div v-if="auth.logged === true" class="flex gap-5 items-center">
                <button @click="startGame()" v-if="stateProps.showPlayButton.value" class="bg-zinc-700 px-3 py-1 m-1 text-zinc-200 rounded-lg">
                    {{ stateProps.showPong.value ? 'Quit' : 'Play' }} 
                </button>
                <div>
                    <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.logout">Logout</div>
                </div>
                <div>
                    <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.showUserForm = true">Profile</div>
                </div>
            </div>
            <div v-if="auth.logged === false">
                <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.showForm = true">Login</div>
            </div>
        </div>
    </div>
</template>