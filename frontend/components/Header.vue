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
    cancelAnimationFrame(stateProps.animationFrameId.value);
    stateProps.endGameLoop.value = true;

    socket.emit('quitMatchButton', {
        player: auth.session.username,
        lobbyId: stateProps.gameLobbyId.value
    })
    socket.emit('stopGameSession', {
        gameId: stateProps.gameLobbyId.value
    })
    socket.emit('deleteGameSession', {
        gameId: stateProps.gameLobbyId.value
    })
    
    await client.game.removeFromGameQueue(gameProps.gameState.value.playerOneName)
    await client.game.removeFromGameQueue(gameProps.gameState.value.playerTwoName)
    
    stateProps.resetMatchmakingWindow()
    stateProps.showPong.value = false;
    gameProps.gameState.value = {}
    stateProps.gameLobbyId.value = ""
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
            //start game countdown 
            stateProps.timeElapsed.value = 3;
            const timeElapsedInterval = setInterval(() => {
                stateProps.timeElapsed.value--;
            }, 1000);
            await client.waitDuration(3000)
            clearInterval(timeElapsedInterval)
            stateProps.timeElapsed.value = 0

            stateProps.showPong.value = true;
            stateProps.showPlayButton.value = true;
            socket.emit('startGameSession', {
                gameId: stateProps.gameLobbyId.value
            })
            stateProps.endGameLoop.value = false;
            gameProps.gameStatus.value = 'running';
            socket.emit('chatStatus', {
                sender: auth.session.username,
                text: 'INGAME',
            });
            gameProps.gameLoop();
            stateProps.resetMatchmakingWindow()
            return ;
        }
        else
        {
            socket.emit('deleteGameSession', {
                gameId: stateProps.gameLobbyId.value
            })
            stateProps.gameLobbyId.value = ""
            await client.game.removeFromGameQueue(auth.session.username)
            stateProps.resetMatchmakingWindow()
        }
    }
    else 
    {
        console.log('startGameButton: Quitting game...')
        await quitMatchButton();
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

onUpdated(async () => {
    socket.emit('getActiveGameSessions', {})
})

onMounted(async () => {
    await socket.connect()
    console.log('onMounted: Socket.io CONNECTED')
    await auth.refreshSession()

    socket.on('getActiveGameSessionsResponse', (data:any) => {
        stateProps.activeGameSessions.value = data.response
    })


    socket.emit('getActiveGameSessions', {})
})

</script>

<template>
    <div class="h-62px">
        <div class="container mx-auto justify-between h-full flex items-center px-5">
            <div>
                Ft_transcendence
            </div>
            <div v-if="auth.logged === true" class="flex gap-5 items-center">
                <div>
                    <p>Active game sessions : {{ stateProps.activeGameSessions.value }}</p>
                </div>
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