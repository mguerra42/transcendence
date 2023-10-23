<template>
    <div class="flex-col " v-show="stateProps.showPong.value">
        <div class="flex justify-between p-2 mx-4">
            <div class="text-lg text-zinc-100">
                {{ gameProps.Player1.value.name }} - <b> {{ gameProps.Player1.value.score }} </b>
            </div>
            <div class="text-lg text-zinc-100">
                <b> {{ gameProps.Player2.value.score }} </b> - {{ gameProps.Player2.value.name }}
            </div>
        </div>

        <div class="">
            <canvas v-show="stateProps.showPong.value" tabindex="0" @keydown.down="gameProps.player1MoveDown" @keydown.up="gameProps.player1MoveUp" class="bg-zinc-300 focus-outline-none rounded-lg cursor-crosshair" id="canvas"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
    const auth = useAuth()
    const client = useClient()
    const socket = useSocket()

    const { stateProps, gameProps } = defineProps<{
        stateProps: any;
        gameProps: any;
    }>();

    const hasRefresh = async() => {

        const userExists: any = await useRequest(`/matchmaking/getUserFromQueue?playerUsername=${auth.session.username}`, {
            method: 'GET',
        })
        if (userExists.data.value.profile !== undefined) {
            auth.refresh = true
        }
    }

    onMounted( async () => {
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
            //console.log('abortMatchResponse, data : ', data, 'auth.session.username : ', auth.session.username, 'gameProps.Player1.value.name : ', gameProps.Player1.value.name, 'gameProps.Player2 : ', gameProps.Player2)
            if ((auth.session.username === gameProps.Player1.value.name && data.player === gameProps.Player2.value.name) || (auth.session.username === gameProps.Player2.value.name && data.player === gameProps.Player1.value.name))
            {
                //console.log('abortMatchResponse work')
                gameProps.resetGame();
                cancelAnimationFrame(stateProps.animationFrameId.value);
                await client.game.removeFromGameQueue(auth.session.username)
                // lobby is deleted by initiator of the abortMatch
                // await client.game.deleteLobbyById(stateProps.gameLobbyId.value)
                stateProps.showPong.value = false;
                stateProps.showPlayButton.value = true;
                stateProps.resetMatchmakingWindow()
            }
            //console.log('abortMatchResponse dont work')
        });

        await hasRefresh();

            if (auth.refresh === true) {
                stateProps.showPong.value = true;
                stateProps.showPlayButton.value = true;
                auth.refresh = false;
                console.log('refreshed')
                gameProps.set();
                gameProps.gameLoop();    
            }

    });
</script>
