<template>
    <button @click="startGame()" v-if="stateProps.showPlayButton.value" class="bg-zinc-700 px-3 py-1 m-1 text-zinc-200 rounded-lg">
        {{ stateProps.showPong.value ? 'Quit' : 'Play' }} 
    </button>
    <div class="">
        <canvas v-show="stateProps.showPong.value" tabindex="0" @keydown.down="gameProps.player1MoveDown" @keydown.up="gameProps.player1MoveUp" class="bg-zinc-300 focus-outline-none rounded-lg cursor-crosshair" id="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
    const auth = useAuth()
    const client = useClient()
    const socket = useSocket()

    const gameLobby = ref("")

    const abortMatch = () => {
        stateProps.matchDeclined.value = true;
        socket.emit('abortMatch', {
            player: auth.session.username,
            senderSocketId: auth.session.socketId,
            receiverSocketId: stateProps.opponentProfile.value.socketId
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
                console.log("gamelobby : ", stateProps.gameLobbyId.value)
                await client.game.getNormalQueuePlayers()
                
                stateProps.showPong.value = true;
                stateProps.showPlayButton.value = true;
                stateProps.resetMatchmakingWindow()
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
            await client.game.removeFromGameQueue(auth.session.username)
            await client.game.deleteLobbyById(stateProps.gameLobbyId.value)
            stateProps.showPong.value = false;
            stateProps.showPlayButton.value = true;
            stateProps.resetMatchmakingWindow()
            
        }
    }

    const { stateProps, gameProps } = defineProps<{
        stateProps: any;
        gameProps: any;
    }>();

    onMounted(() => {
        stateProps.canvas.value = document.getElementById("canvas");
        stateProps.context.value = stateProps.canvas.value.getContext("2d");
 
        stateProps.canvas.value.width = 800;
        stateProps.canvas.value.height = 600;

        stateProps.context.value.fillStyle = "blue";
        stateProps.context.value.fillRect(gameProps.Player1.value.x, gameProps.Player1.value.y, gameProps.Player1.value.width, gameProps.Player1.value.height)
        stateProps.context.value.fillRect(gameProps.Player2.value.x, gameProps.Player2.value.y, gameProps.Player2.value.width, gameProps.Player2.value.height)
        stateProps.context.value.fillRect(gameProps.Ball.value.x, gameProps.Ball.value.y, gameProps.Ball.value.width, gameProps.Ball.value.height)
        
        socket.on('playerMovementResponse', (data: any) => {
            if (data.player === stateProps.opponentProfile.value.username)
            {
                if (data.move === 'moveUp')
                    gameProps.player2MoveUp();
                else
                    gameProps.player2MoveDown();
            }
        });
        
        socket.on('challengePlayerResponse', async (data: any) => {
            if (data.challenger === stateProps.opponentProfile.value.username)
                stateProps.gameLobbyId.value = data.lobbyId
        })

        socket.on('matchmakingConfirmResponse', (data: any) => {
            if (data.player === stateProps.opponentProfile.value.username)
            {
                if (data.confirm === 'decline')
                    stateProps.opponentDeclined.value = true;
                if (data.confirm === 'accept')
                    stateProps.opponentAccepted.value = true;
            }
        });

        socket.on('abortMatchResponse', async (data: any) => {
            if (data.player === stateProps.opponentProfile.value.username)
            {
                gameProps.resetGame();
                cancelAnimationFrame(stateProps.animationFrameId.value);
                await client.game.removeFromGameQueue(auth.session.username)
                // lobby is deleted by initiator of the abortMatch
                // await client.game.deleteLobbyById(stateProps.gameLobbyId.value)
                stateProps.showPong.value = false;
                stateProps.showPlayButton.value = true;
                stateProps.resetMatchmakingWindow()
            }
        });

    });
</script>
