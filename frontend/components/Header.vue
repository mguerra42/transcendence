<script setup lang="ts">
const auth = useAuth()
const socket = useSocket()
const client = useClient()

const { stateProps, gameProps } = defineProps<{
    stateProps: any,
    gameProps: any
}>();

const quitMatchButton = async () => {
    console.log('quitMatchButton: Sending abort match socket from ', auth.session.username)
    stateProps.matchDeclined.value = true;
    stateProps.endGameLoop.value = true;
    socket.emit('quitMatchButton', {
        player: auth.session.username,
        lobbyId: stateProps.gameLobbyId.value
    })
    socket.emit('stopGameSession', {
            gameId: stateProps.gameLobbyId.value
    })
    stateProps.showPong.value = false;
    stateProps.showPlayButton.value = true;

    await client.game.removeFromGameQueue(auth.session.username)
    stateProps.resetMatchmakingWindow()
    gameProps.gameState.value = {}
    stateProps.gameLobbyId.value = ""

}

const startGameButton = async () => {
    console.log('startGameButton: Looking for a match for ', auth.session.username, '...')
    if (stateProps.showPong.value === false) {

        stateProps.showCancelButton.value = true;
        stateProps.showLoader.value = true;
        stateProps.showPlayButton.value = false;
        
        //find match
        const matchFound = await stateProps.waitForMatch();
        if (matchFound === null)
        {
            console.log('startGameButton: Could not find a match.')
            await client.game.removeFromGameQueue(auth.session.username)
            
            if (stateProps.cancelMatch.value === true) {
                stateProps.MatchmakingError.value = 'You have left the queue.'
            }
            else {
                stateProps.MatchmakingError.value = 'No players available.'
            }
            stateProps.showCancelButton.value = false
            stateProps.showMatchmakingError.value = true
            await client.waitDuration(2000)
            stateProps.resetMatchmakingWindow()
            return ;
        }
        //confirm
        await stateProps.waitForConfirm();
        if (stateProps.matchAccepted.value === true && stateProps.opponentAccepted.value === true)
        {
            
            //TODO 
            //Matchmaking works, check decline and then clean up, and hten bring back pong
            console.log('match made succesfully between ' , gameProps.gameState.value.playerOneName , ' and ', gameProps.gameState.value.playerTwoName, ' in lobby ', stateProps.gameLobbyId.value)
            await client.waitDuration(3000)
            stateProps.showPong.value = true;
            stateProps.showPlayButton.value = true;
            // const ret = gameProps.refreshGameSession();
            socket.emit('startGameSession', {
                gameId: stateProps.gameLobbyId.value
            })
            stateProps.endGameLoop.value = false;
            // await client.game.setQueueStatus(auth.session.username, 'in-game')
            gameProps.gameLoop();
            stateProps.resetMatchmakingWindow()
            // await client.game.removeFromGameQueue(auth.session.username)
            return ;
        }
        else
        {
            console.log('startGameButton: Match declined ', stateProps.opponentProfile.value.username)
            await client.game.removeFromGameQueue(auth.session.username)
            stateProps.resetMatchmakingWindow()
        }
    }
    else 
    {
        console.log('startGameButton: Quitting game...')
        socket.emit('stopGameSession', {
            gameId: stateProps.gameLobbyId.value
        })
        await quitMatchButton();
        // gameProps.resetGame();
        cancelAnimationFrame(stateProps.animationFrameId.value);
        
        console.log('startGameButton: Removing players from queue')
        // await client.game.removeFromGameQueue(gameProps.Player1.value.name)
        // await client.game.removeFromGameQueue(gameProps.Player2.value.name)
        
        console.log('startGameButton: Deleting lobby ', stateProps.gameLobbyId.value)
        await client.game.deleteLobbyById(stateProps.gameLobbyId.value)
        
        stateProps.showPong.value = false;
        stateProps.showPlayButton.value = true;
        stateProps.resetMatchmakingWindow()

        console.log('startGameButton: Resetting chat status to ONLINE')
        socket.emit('chatStatus', {
            sender: auth.session.username,
            text: 'ONLINE',
        });
        console.log('startGameButton: Reset game status')
        gameProps.gameStatus.value = '';
    }
}
onBeforeUnmount(() => {
        socket.disconnect()
        console.log('onBeforeUnMount: Socket.io DISCONNECTED')
})

onMounted(async () => {
    await socket.connect()
    console.log('onMounted: Socket.io CONNECTED')
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
                <button @click="startGameButton()" v-if="stateProps.showPlayButton.value" class="bg-zinc-700 px-3 py-1 m-1 text-zinc-200 rounded-lg">
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