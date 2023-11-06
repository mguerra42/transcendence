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
