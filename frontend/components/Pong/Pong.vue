<template >
    <div class="flex-col" v-show="stateProps.showPong.value" >
        <div v-if="gameProps.gameState.value" class="flex justify-between p-2 mx-4">
            <div class="text-lg text-zinc-100">
                {{ gameProps.gameState.value.playerOneName }} - <b> {{ gameProps.gameState.value.playerOneScore }} </b>
            </div>
            <div class="text-lg text-zinc-100">
                <b> {{ gameProps.gameState.value.playerTwoName }} </b> - {{ gameProps.gameState.value.playerTwoScore }}
            </div>
        </div>

        <div v-if="stateProps.showQuitGame.value === true" class="absolute top-0 bottom-0 left-0 right-0 z-10 flex justify-center items-center bg-black/60 backdrop-blur-sm" >
            <div class="w-80 bg-zinc-800 p-6 rounded-lg flex-col items-center justify-center relative">
                <p class="text-center m-2"> Leave Game</p>
                <p class="text-center"> Warning : If you leave, you will forfeit to your opponent.</p>
                <div class="flex m-4 items-center justify-center">
                    <button @click="returnToGame" class="w-1/3 rounded m-2 bg-zinc-600">Return</button>
                </div>
                <p class="text-center font-bold"> {{ stateProps.timeElapsed.value }}</p>
            </div>
        </div>

        <div class="" >
            <canvas tabindex="0" @keydown.down="gameProps.player1MoveDown" @keydown.up="gameProps.player1MoveUp" class="bg-zinc-300 focus-outline-none autofocus rounded-lg cursor-crosshair" id="canvas"></canvas>
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

    const returnToGame = () => {
        stateProps.returnToGame.value = true
    }
    const hasRefresh = async() => {
        socket.emit('resumeGame', { username : auth.session.username })
        for (let attempts = 0; attempts < 100; attempts++){
            if (stateProps.gameLobbyId.value !== ""){
                break ;
            }
            await client.waitDuration(10)
        }

        if (stateProps.gameLobbyId.value !== ""){
            auth.refresh = true
        }
        return null
    }

    const setCanvasSize = () => {

        const windowSize = stateProps.getWindowSize()
        if (windowSize.width >= 800 && windowSize.height >= 600)
        {
            stateProps.canvasMode.value = 'BIG'
            gameProps.gameDimensions.value.canvasWidth = 800
            gameProps.gameDimensions.value.canvasHeight = 600
            gameProps.gameDimensions.value.playerOneWidth = 14
            gameProps.gameDimensions.value.playerOneHeight = 70
            gameProps.gameDimensions.value.playerTwoWidth = 14
            gameProps.gameDimensions.value.playerTwoHeight = 70
            gameProps.gameDimensions.value.playerOneXPos = 20
            gameProps.gameDimensions.value.playerTwoXPos = 800 - 20 - gameProps.gameDimensions.value.playerTwoWidth
            gameProps.gameDimensions.value.ballSize = 20
            stateProps.canvas.value.width = gameProps.gameDimensions.value.canvasWidth
            stateProps.canvas.value.height = gameProps.gameDimensions.value.canvasHeight
        }
        else
        {
            stateProps.canvasMode.value = 'SMALL'
            gameProps.gameDimensions.value.canvasWidth = 400
            gameProps.gameDimensions.value.canvasHeight = 300
            gameProps.gameDimensions.value.playerOneWidth = 7
            gameProps.gameDimensions.value.playerOneHeight = 35
            gameProps.gameDimensions.value.playerTwoWidth = 7
            gameProps.gameDimensions.value.playerTwoHeight = 35
            gameProps.gameDimensions.value.playerOneXPos = 10
            gameProps.gameDimensions.value.playerTwoXPos = 400 - 10 - gameProps.gameDimensions.value.playerTwoWidth
            gameProps.gameDimensions.value.ballSize = 10
            stateProps.canvas.value.width = gameProps.gameDimensions.value.canvasWidth
            stateProps.canvas.value.height = gameProps.gameDimensions.value.canvasHeight
        }
    }

    const handleResize = () => {
        setCanvasSize()
    };
    
    onMounted( async () => {
        stateProps.canvas.value = document.getElementById("canvas");
        stateProps.context.value = stateProps.canvas.value.getContext("2d");

        setCanvasSize()

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
