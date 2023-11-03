<template >
    <div class="flex-col" v-show="stateProps.showPong.value" >
        <div class="flex justify-between p-2 mx-4">
            <div class="text-lg text-zinc-100">
                {{ gameProps.Player1.value.name }} - <b> {{ gameProps.Player1.value.score }} </b>
            </div>
            <div class="text-lg text-zinc-100">
                <b> {{ gameProps.Player2.value.score }} </b> - {{ gameProps.Player2.value.name }}
            </div>
        </div>

        <div class="" >
            <canvas tabindex="0" @keydown.down="gameProps.player1MoveDown" @keydown.up="gameProps.player1MoveUp" class="bg-zinc-300 focus-outline-none rounded-lg cursor-crosshair" id="canvas"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
    const auth = useAuth()
    const client = useClient()
    const socket = useSocket()
    const canvas = ref()

    const { stateProps, gameProps } = defineProps<{
        stateProps: any;
        gameProps: any;
    }>();

    const hasRefresh = async() => {
        console.log('hasRefresh: Refreshing Pong status...')

        const userExists: any = await useRequest(`/matchmaking/getUserInGameFromQueue?playerUsername=${auth.session.username}`, {
            method: 'GET',
        })

        if (userExists.data.value.profile !== undefined) {
            console.log('hasRefresh: ', auth.session.username, ' is in game. Refreshing canvas...')
            auth.refresh = true
        }
        else {
            const userInQueue: any = await useRequest(`/matchmaking/getUserFromQueue?playerUsername=${auth.session.username}`, {
                method: 'GET',
            })
            if (userInQueue.data.value.profile !== undefined) {
                console.log('hasRefresh: ', auth.session.username,' is not in game. Removing from game queue...')
                await client.game.removeFromGameQueue(auth.session.username)
            }
            else
            {
                console.log('hasRefresh: ', auth.session.username,' is not in game or in queue.')
            }
        }
    }

    const setCanvasSize = () => {

        const windowSize = stateProps.getWindowSize()
        if (windowSize.width >= 800 && windowSize.height >= 600)
        {
            stateProps.canvas.value.width = 800;
            stateProps.canvas.value.height = 600;
            
            gameProps.Player1.value.width = 14;
            gameProps.Player1.value.height = 70;
            gameProps.Player1.value.x = 25;
            gameProps.Player1.value.y = 20;

            gameProps.Player2.value.width = 14;
            gameProps.Player2.value.height = 70;
            gameProps.Player2.value.x = 800 - 35;
            gameProps.Player2.value.y = 20;

            gameProps.Ball.value.width = 20;
            gameProps.Ball.value.height = 20;
            gameProps.Ball.value.x = 390;
            gameProps.Ball.value.y = 290;
            gameProps.Ball.value.velocityX = 6;
            gameProps.Ball.value.velocityY = 6;
        }
        else
        {
            stateProps.canvas.value.width = 400;
            stateProps.canvas.value.height = 300;
            
            gameProps.Player1.value.width = 7;
            gameProps.Player1.value.height = 35;
            gameProps.Player1.value.x = 12;
            gameProps.Player1.value.y = 10;
        
            gameProps.Player2.value.width = 7;
            gameProps.Player2.value.height = 35;
            gameProps.Player2.value.x = 400 - 17;
            gameProps.Player2.value.y = 10;

            gameProps.Ball.value.width = 15;
            gameProps.Ball.value.height = 15;
            gameProps.Ball.value.x = 190;
            gameProps.Ball.value.y = 140;
            gameProps.Ball.value.velocityX = 3;
            gameProps.Ball.value.velocityY = 3;
        }
    }

    const handleResize = () => {
            // The window has been resized
            console.log('Window resized');
            setCanvasSize()

    };
    
    onMounted( async () => {
        stateProps.canvas.value = document.getElementById("canvas");
        stateProps.context.value = stateProps.canvas.value.getContext("2d");

        setCanvasSize()

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
            {
                if (stateProps.gameLobbyId.value !== data.lobbyId)
                    await client.game.deleteLobbyById(stateProps.gameLobbyId.value)
                stateProps.gameLobbyId.value = data.lobbyId
                console.log('socketChallengePlayerResponse: Received challenge socket from ', data.challenger, ' with lobby ', data.lobbyId)
                console.log('i am player 2 !')
                //TODO : persist this value after refresh
                gameProps.isPlayerTwo.value = true
            }
        })

        socket.on('matchmakingConfirmResponse', (data: any) => {
            if (data.lobby === stateProps.gameLobbyId.value && data.player !== auth.session.username)
            {
                if (data.confirm === 'decline')
                    stateProps.opponentDeclined.value = true;
                if (data.confirm === 'accept')
                    stateProps.opponentAccepted.value = true;
            }
        });

        socket.on('quitMatchButtonResponse', async (data: any) => {
            console.log('socketquitMatchButtonResponse: Received abort match socket from ', data.player)

            if (data.player !== auth.session.username && data.lobbyId === stateProps.gameLobbyId.value)
            {
                console.log('socketquitMatchButtonResponse: Aborting match between ', auth.session.username, ' and ', data.player, ' in lobby ', stateProps.gameLobbyId.value)
                gameProps.resetGame();
                cancelAnimationFrame(stateProps.animationFrameId.value);
                console.log('value of endGameLoop in quitMatchButton response', stateProps.endGameLoop.value)
                stateProps.endGameLoop.value = true;
                stateProps.showPong.value = false;
                stateProps.showPlayButton.value = true;
                stateProps.resetMatchmakingWindow()
                await client.game.deleteLobbyById(stateProps.gameLobbyId.value)
                await client.game.removeFromGameQueue(auth.session.username)
            }

            console.log('socketquitMatchButtonResponse: Resetting chat status to ONLINE')
            socket.emit('chatStatus', {
                sender: auth.session.username,
                text: 'ONLINE',
            });
        });

        await hasRefresh();
        if (auth.refresh === true) {
            stateProps.showPong.value = true;
            stateProps.showPlayButton.value = true;
            auth.refresh = false;
            gameProps.refreshGameSession();
            gameProps.gameLoop();    
        }

        window.addEventListener('resize', handleResize);
    });
    
    onBeforeUnmount(() => {
        window.removeEventListener('resize', handleResize);
    });

</script>
