<script setup lang="ts">
const auth = useAuth()
const client = useClient()
const socket = useSocket()

const stateProps = {
    // MISC. VARIABLES
    canvas: ref(),
    context: ref(),
    timeElapsed: ref(0),
    animationFrameId: ref(),
    MatchmakingError: ref('Matchmaking : An error occured.'),

    // COMPONENTS
    showMatchmakingError: ref(false),
    showPlayButton: ref(true),
    showPong: ref(false),
    showLoader: ref(false),
    showMatchFound: ref(false),

    // MATCH CONFIRM
    gameLobbyId: ref(''),
    matchAccepted: ref(false),
    matchDeclined: ref(false),
    opponentDeclined: ref(false),
    opponentAccepted: ref(false),
    opponentProfile: ref<{ username?: string; id?: string; socketId?: string; avatarPath?: string }>({}),

    // MATCHMAKING FUNCTIONS
    waitForMatch: async () => {
        // hide play button when waiting for match
        stateProps.showPlayButton.value = false

        // show loading screen when waiting for match
        stateProps.showLoader.value = true

        // update time count every second
        const timeElapsedInterval = setInterval(() => {
            stateProps.timeElapsed.value++
        }, 1000)

        // add in game queue
        await client.game.addToGameQueue(auth.session.username)

        // wait for match to be found
        const matchOpponent: any = await client.game.findAMatch(auth.session.username)
        if (matchOpponent === null) {
            // if match isn't found, return null and show error
            stateProps.MatchmakingError.value = 'No players available.'
            // reset time count
            clearInterval(timeElapsedInterval)
            stateProps.timeElapsed.value = 0
            return null
        }
        else {
            // update the opponent profile if match is found
            stateProps.opponentProfile.value.username = matchOpponent.profile?.username
            stateProps.opponentProfile.value.avatarPath = matchOpponent.profile?.avatarPath
            stateProps.opponentProfile.value.id = matchOpponent.profile?.id
            stateProps.opponentProfile.value.socketId = matchOpponent.profile?.socketId
            // addtogamelobby
            // return game lobby
            clearInterval(timeElapsedInterval)
            stateProps.timeElapsed.value = 0
        }
        return matchOpponent
    },

    waitForConfirm: async () => {
        stateProps.showMatchFound.value = true
        stateProps.timeElapsed.value = 10
        const timeElapsedInterval = setInterval(() => {
            stateProps.timeElapsed.value--
        }, 1000)
        stateProps.showLoader.value = false
        await Promise.race([
            new Promise<void>(timeout => setTimeout(timeout, 10000)),
            new Promise<void>((resolve) => {
                const checkMatchAccepted = () => {
                    if (stateProps.matchAccepted.value === true && stateProps.opponentAccepted.value === true)
                        resolve()

                    else if (stateProps.opponentDeclined.value === true && stateProps.matchDeclined.value === false)
                        resolve()

                    else if (stateProps.matchDeclined.value === true && stateProps.opponentDeclined.value === false)
                        resolve()

                    else
                        setTimeout(checkMatchAccepted, 100)
                }
                checkMatchAccepted()
            }),
        ])
        clearInterval(timeElapsedInterval)
        stateProps.timeElapsed.value = 0
    },

    resetMatchmakingWindow: async () => {
        stateProps.showMatchFound.value = false
        stateProps.matchAccepted.value = false
        stateProps.matchDeclined.value = false
        stateProps.opponentAccepted.value = false
        stateProps.opponentDeclined.value = false
    },
}

const gameProps = {

    Player1: ref({
        width: 15,
        height: 70,
        x: 25,
        y: 20,
    }),

    Player2: ref({
        width: 15,
        height: 70,
        x: 800 - 35,
        y: 20,
    }),

    Ball: ref({
        width: 20,
        height: 20,
        x: 390,
        y: 290,
        velocityX: 5, // Horizontal velocity (positive moves right, negative moves left)
        velocityY: 5, // Vertical velocity (positive moves down, negative moves up)
    }),

    resetGame: () => {
        // reinitialize values here
    },

    player1MoveDown: (event: any) => {
        if (event.key === 'ArrowDown' && gameProps.Player1.value.y < 500) { // Use 'ArrowDown' instead of 'Down'
            gameProps.Player1.value.y += 15
            socket.emit('playerMovement', {
                player: auth.session.username,
                move: 'moveDown',
            })
            gameProps.refreshCanvas()
        }
    },

    player1MoveUp: (event: any) => {
        if (event.key === 'ArrowUp' && gameProps.Player1.value.y > 20) { // Use 'ArrowDown' instead of 'Down'
            gameProps.Player1.value.y -= 15
            socket.emit('playerMovement', {
                player: auth.session.username,
                move: 'moveUp',
            })
            gameProps.refreshCanvas()
        }
    },

    player2MoveDown: () => {
        if (gameProps.Player2.value.y < 500)
            gameProps.Player2.value.y += 20
        gameProps.refreshCanvas()
    },

    player2MoveUp: () => {
        if (gameProps.Player2.value.y > 20)
            gameProps.Player2.value.y -= 20
        gameProps.refreshCanvas()
    },

    refreshCanvas: () => {
        stateProps.context.value.clearRect(0, 0, stateProps.canvas.value.width, stateProps.canvas.value.height)
        stateProps.context.value.fillRect(gameProps.Player1.value.x, gameProps.Player1.value.y, gameProps.Player1.value.width, gameProps.Player1.value.height)
        stateProps.context.value.fillRect(gameProps.Player2.value.x, gameProps.Player2.value.y, gameProps.Player2.value.width, gameProps.Player2.value.height)
        stateProps.context.value.fillRect(gameProps.Ball.value.x, gameProps.Ball.value.y, gameProps.Ball.value.width, gameProps.Ball.value.height)
    },

    gameLoop: () => {
        // Update the Ball's position based on its velocity
        gameProps.Ball.value.x += gameProps.Ball.value.velocityX
        gameProps.Ball.value.y += gameProps.Ball.value.velocityY

        // Check for collision with Player1
        if (
            gameProps.Ball.value.x < gameProps.Player1.value.x + gameProps.Player1.value.width
                && gameProps.Ball.value.x + gameProps.Ball.value.width > gameProps.Player1.value.x
                && gameProps.Ball.value.y < gameProps.Player1.value.y + gameProps.Player1.value.height
                && gameProps.Ball.value.y + gameProps.Ball.value.height > gameProps.Player1.value.y
        ) {
            // Ball collided with Player1, reverse its horizontal velocity
            gameProps.Ball.value.velocityX = -gameProps.Ball.value.velocityX
        }

        // Check for collision with Player2
        if (
            gameProps.Ball.value.x < gameProps.Player2.value.x + gameProps.Player2.value.width
                && gameProps.Ball.value.x + gameProps.Ball.value.width > gameProps.Player2.value.x
                && gameProps.Ball.value.y < gameProps.Player2.value.y + gameProps.Player2.value.height
                && gameProps.Ball.value.y + gameProps.Ball.value.height > gameProps.Player2.value.y
        ) {
            // Ball collided with Player2, reverse its horizontal velocity
            gameProps.Ball.value.velocityX = -gameProps.Ball.value.velocityX
        }

        // Bounds collission
        if (gameProps.Ball.value.x > 780) {
            gameProps.Ball.value.x = 390
            gameProps.Ball.value.y = 290
            gameProps.Ball.value.velocityX = 0
            gameProps.Ball.value.velocityY = 0

            setTimeout(() => {
                const randomDirectionX = Math.random() > 0.5 ? 1 : -1 // Randomly choose 1 or -1
                const randomDirectionY = Math.random() > 0.5 ? 1 : -1 // Randomly choose 1 or -1

                gameProps.Ball.value.velocityX = 5
                gameProps.Ball.value.velocityY = 5
            }, 1000)
        }
        if (gameProps.Ball.value.y > 580)
            gameProps.Ball.value.velocityY = gameProps.Ball.value.velocityY * -1

        if (gameProps.Ball.value.x < 0) {
            gameProps.Ball.value.x = 390
            gameProps.Ball.value.y = 290
            gameProps.Ball.value.velocityX = 0
            gameProps.Ball.value.velocityY = 0

            setTimeout(() => {
                const randomDirectionX = Math.random() > 0.5 ? 1 : -1 // Randomly choose 1 or -1
                const randomDirectionY = Math.random() > 0.5 ? 1 : -1 // Randomly choose 1 or -1

                gameProps.Ball.value.velocityX = 5
                gameProps.Ball.value.velocityY = 5
            }, 1000)
        }
        if (gameProps.Ball.value.y < 0)
            gameProps.Ball.value.velocityY = gameProps.Ball.value.velocityY * -1

        // Clear and redraw the Ball on the canvas
        stateProps.context.value.clearRect(0, 0, stateProps.canvas.value.width, stateProps.canvas.value.height)
        stateProps.context.value.fillStyle = 'blue'
        stateProps.context.value.fillRect(gameProps.Player1.value.x, gameProps.Player1.value.y, gameProps.Player1.value.width, gameProps.Player1.value.height)
        stateProps.context.value.fillRect(gameProps.Player2.value.x, gameProps.Player2.value.y, gameProps.Player2.value.width, gameProps.Player2.value.height)
        stateProps.context.value.fillRect(gameProps.Ball.value.x, gameProps.Ball.value.y, gameProps.Ball.value.width, gameProps.Ball.value.height)
        // Call the game loop recursively
        stateProps.animationFrameId.value = requestAnimationFrame(gameProps.gameLoop)
    },
}

onMounted(async () => {
    await socket.connect()
})
</script>

<template>
  <PongMatchmaking :state-props="stateProps" />
  <Pong v-if="auth.logged" :state-props="stateProps" :game-props="gameProps" />
</template>
