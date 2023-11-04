<script setup lang="ts">
  import { getDefaultCompilerOptions } from 'typescript';
import { appName } from '~/constants'
  const isLoading = ref(true);
  
  //STORES
  const auth = useAuth()
  const client = useClient()
  const socket = useSocket()

  //STATIC FUNCTION
  const finishGame = async (winner:string) => {
        // socket.emit('stopGameSession', {
        //     gameId: stateProps.gameLobbyId.value
        // })
        // //clean up backend
        // console.log('finishGame: Game finished, removing ', auth.session.username, ' from queue and deleting lobby ', stateProps.gameLobbyId.value)
        // await client.game.removeFromGameQueue(auth.session.username)
        // //await client.game.deleteLobbyById(stateProps.gameLobbyId.value)

        // //le winner crée l'objet game dans la DB pour eviter doublon
        // if (winner == 'P1' && auth.session.username == gameProps.Player1.value.name)
        //     await client.game.createEndGame(gameProps.Player1.value.name, gameProps.Player2.value.name, gameProps.Player1.value.score, gameProps.Player2.value.score);
        // else if (winner == 'P2' && auth.session.username == gameProps.Player2.value.name)
        //     await client.game.createEndGame(gameProps.Player2.value.name, gameProps.Player1.value.name, gameProps.Player2.value.score, gameProps.Player1.value.score);
        // //else, le user est perdant donc n'a pas a crée l'objet game.
            
        // //reset frontend
        // cancelAnimationFrame(stateProps.animationFrameId.value);
        // gameProps.resetGame();
        // auth.refreshSession();

        // stateProps.showPong.value = false;
        // stateProps.showPlayButton.value = true;

        // stateProps.showEndGame.value = true;
        // await new Promise (timeout => setTimeout(timeout, 2000))
        // stateProps.showEndGame.value = false;
        
        // stateProps.resetMatchmakingWindow()
        // console.log('finishGame: Resetting chat status to ONLINE')
        // socket.emit('chatStatus', {
        //     sender: auth.session.username,
        //     text: 'ONLINE',
        // });
        // console.log('finishGame: Reset game status')
        // gameProps.gameStatus.value = '';

        // client.game.gameArray = await client.game.getGameArray();
  }
  //PROPS
  const stateProps = {

    //MISC. VARIABLES
    canvas: ref(),
    context: ref(),
    timeElapsed: ref(0),
    animationFrameId: ref(),
    MatchmakingError: ref('Matchmaking : An error occured.'),
    showEndGame: ref(false),

    //COMPONENTS
    showCancelButton: ref(false),
    showMatchmakingError: ref(false),
    showPlayButton: ref(true),
    showPong: ref(false),
    showLoader: ref(false),
    showMatchFound: ref(false),

    //MATCH CONFIRM
    gameLobbyId: ref(""),
    cancelMatch: ref(false),
    matchAccepted: ref(false),
    matchDeclined: ref(false),
    opponentDeclined: ref(false),
    opponentAccepted: ref(false),
    endGameLoop: ref(false),
    opponentProfile: ref<{ username?: string; id?: string; socketId?: string; avatarPath?: string; }>({}),
    
    getWindowSize: () => {
        const window = document.getElementById("haha");
        if (window === null)
            return null
        return {
            height: window.offsetHeight,
            width: window.offsetWidth,
        }
    },

    //MATCHMAKING FUNCTIONS
    waitForMatch: async() => {
        const timeoutLimit = 100;
        await client.game.addToGameQueue(auth.session.username)

        socket.emit('readyForMatchmaking', { player: auth.session.username })
        console.log('waitForMatch: Waiting for an opponent...')
        const timeElapsedInterval = setInterval(() => {
            stateProps.timeElapsed.value++;
        }, 1000);
        for (let attempt = 0; attempt < timeoutLimit; attempt++)
        {
            if (stateProps.gameLobbyId.value !== "" || stateProps.cancelMatch.value === true)
            {
                socket.emit('getGameState', { gameId: stateProps.gameLobbyId.value })
                break ;
            }
            await client.waitDuration(100)
        }

        clearInterval(timeElapsedInterval)
        if (stateProps.gameLobbyId.value !== ""){
            return stateProps.gameLobbyId.value
        }
        return null;
    },

    waitForConfirm: async () => {
        stateProps.showMatchFound.value = true;
        stateProps.showLoader.value = false;
        stateProps.timeElapsed.value = 10;

        const timeElapsedInterval = setInterval(() => {
            stateProps.timeElapsed.value--;
        }, 1000);
        await Promise.race([
            new Promise<void>(timeout => setTimeout(timeout, 10000)),
            new Promise<void>(resolve => {
                const checkMatchAccepted = () => {
                    if (stateProps.matchAccepted.value === true && stateProps.opponentAccepted.value === true)
                    {
                        resolve();
                    }
                    else if (stateProps.opponentDeclined.value === true || stateProps.matchDeclined.value === true)
                    {
                        resolve();
                    }
                    else
                        setTimeout(checkMatchAccepted, 10);
                };
                checkMatchAccepted();
            }),   
        ]);
        clearInterval(timeElapsedInterval);
        stateProps.timeElapsed.value = 0;
    },

    resetMatchmakingWindow: async () => {
        stateProps.showLoader.value = false;
        stateProps.showMatchFound.value = false;
        stateProps.showCancelButton.value = false;
        
        stateProps.cancelMatch.value = false;
        stateProps.matchAccepted.value = false;
        stateProps.matchDeclined.value = false;
        stateProps.opponentAccepted.value = false;
        stateProps.opponentDeclined.value = false;
        stateProps.showMatchmakingError.value = false

        // stateProps.opponentProfile.value = {}
        // stateProps.endGameLoop.value = false;
        // stateProps.gameLobbyId.value = ""
        stateProps.timeElapsed.value = 0;
        stateProps.showPlayButton.value = true;
    },
  };
  
  const gameProps = {
    gameStatus: ref(''),
    newRound: ref(false),
    isPlayerTwo: ref(false),
    initialDirection: ref(1),

    gameState: ref({
        playerOneName: '',
        playerTwoName: '',
        playerOnePos: 0,
        playerTwoPos: 0,
        playerOneScore: 0,
        playerTwoScore: 0,
        ballPositionX: 0,
        ballPositionY: 0,
        canvasWidth: 0,
        canvasHeight: 0,
    }),

    Player1: ref({
        name : "",
        score: 0,
        width: 14,
        height: 70,
        x: 25,
        y: 20
    }),

    Player2: ref({
        name : "",
        score: 0,
        width: 14,
        height: 70,
        x: 800 - 35,
        y: 20
    }),

    Ball: ref({
        width: 20,
        height: 20,
        x: 0,
        y: 0,
        velocityX: 5, // Horizontal velocity (positive moves right, negative moves left)
        velocityY: 5  // Vertical velocity (positive moves down, negative moves up)
    }),

    resetGame: () => {
        //TODO : reinitialize values here
    },

    player1MoveDown: (event:any) => {
        socket.emit('playerMovement', {
            player: auth.session.username,
            gameId: stateProps.gameLobbyId.value,
            move: 'DOWN'
        });
        // if (gameProps.Player2.value.name === auth.session.username)
        // {
        //     if (event.key === 'ArrowDown' && gameProps.Player2.value.y < stateProps.canvas.value.height - gameProps.Player2.value.height) {
        //         gameProps.Player2.value.y += 15;
        //         socket.emit('playerMovement', {
        //             player: auth.session.username,
        //             move:'moveDown' 
        //         });
        //         gameProps.refreshCanvas();
        //     }
        // }
        // else{
        //     if (event.key === 'ArrowDown' && gameProps.Player1.value.y < stateProps.canvas.value.height - gameProps.Player1.value.height) {
        //         gameProps.Player1.value.y += 15;
        //         socket.emit('playerMovement', {
        //             player: auth.session.username,
        //             move:'moveDown' 
        //         });
        //         gameProps.refreshCanvas();
        //     }
        // }
    },

    player1MoveUp: (event:any) => {
        socket.emit('playerMovement', {
            player: auth.session.username,
            gameId: stateProps.gameLobbyId.value,
            move: 'UP'
        });
        // if (gameProps.Player2.value.name === auth.session.username)
        // {
        //     if (event.key === 'ArrowUp' && gameProps.Player2.value.y > gameProps.Player2.value.height) {
        //         gameProps.Player2.value.y -= 15;
        //         socket.emit('playerMovement', {
        //             player: auth.session.username,
        //             gameId: stateProps.gameLobbyId.value 
        //         });
        //         gameProps.refreshCanvas();
        //     }
        // }
        // else
        // {
        //     if (event.key === 'ArrowUp' && gameProps.Player1.value.y > gameProps.Player1.value.height) {
        //         gameProps.Player1.value.y -= 15;
        //         socket.emit('playerMovement', {
        //             player: auth.session.username,
        //             move:'moveUp' 
        //         });
        //         gameProps.refreshCanvas();
        //     }
        // }
    },

    player2MoveDown: () => {
        if (gameProps.Player2.value.name === auth.session.username)
        {
            if (gameProps.Player1.value.y < stateProps.canvas.value.height - gameProps.Player1.value.height)
                gameProps.Player1.value.y += 15;
        }
        else
        {
            if (gameProps.Player2.value.y < stateProps.canvas.value.height - gameProps.Player2.value.height)
                gameProps.Player2.value.y += 15;
        }
        gameProps.refreshCanvas();
    },

    player2MoveUp: () => {
        if (gameProps.Player2.value.name === auth.session.username)
        {
            if (gameProps.Player1.value.y > gameProps.Player1.value.height)
                gameProps.Player1.value.y -= 15;
        }
        else
        {
            if (gameProps.Player2.value.y > gameProps.Player2.value.height)
                gameProps.Player2.value.y -= 15;
        }
        gameProps.refreshCanvas();
    },

    refreshCanvas: () => {
        stateProps.context.value.clearRect(0, 0, stateProps.canvas.value.width, stateProps.canvas.value.height);
        stateProps.context.value.fillRect(gameProps.Player1.value.x, gameProps.Player1.value.y, gameProps.Player1.value.width, gameProps.Player1.value.height);
        stateProps.context.value.fillRect(gameProps.Player2.value.x, gameProps.Player2.value.y, gameProps.Player2.value.width, gameProps.Player2.value.height);
        stateProps.context.value.fillRect(gameProps.Ball.value.x, gameProps.Ball.value.y, gameProps.Ball.value.width, gameProps.Ball.value.height)
    },

    gameLoop: async () => {
        console.log('value of endGameLoop ', stateProps.endGameLoop.value)
        if (stateProps.endGameLoop.value === true)
        {
            return ;
        }
        socket.emit('getGameState', {
            gameId: stateProps.gameLobbyId.value
        })

        new Promise(timeout => setTimeout(timeout, 1000/60))
        gameProps.Ball.value.x = gameProps.gameState.value.ballPositionX;
        gameProps.Ball.value.y = gameProps.gameState.value.ballPositionY;
        gameProps.Player1.value.y = gameProps.gameState.value.playerOnePos;
        gameProps.Player2.value.y = gameProps.gameState.value.playerTwoPos;
        // Check for collision with Player1
        // if (
        //     gameProps.Ball.value.x < gameProps.Player1.value.x + gameProps.Player1.value.width &&
        //     gameProps.Ball.value.x + gameProps.Ball.value.width > gameProps.Player1.value.x &&
        //     gameProps.Ball.value.y < gameProps.Player1.value.y + gameProps.Player1.value.height &&
        //     gameProps.Ball.value.y + gameProps.Ball.value.height > gameProps.Player1.value.y
        // ) {
        //     // Ball collided with Player1, reverse its horizontal velocity
        //     gameProps.Ball.value.velocityX = -gameProps.Ball.value.velocityX;
        // }

        // // Check for collision with Player2
        // if (
        //     gameProps.Ball.value.x < gameProps.Player2.value.x + gameProps.Player2.value.width &&
        //     gameProps.Ball.value.x + gameProps.Ball.value.width > gameProps.Player2.value.x &&
        //     gameProps.Ball.value.y < gameProps.Player2.value.y + gameProps.Player2.value.height &&
        //     gameProps.Ball.value.y + gameProps.Ball.value.height > gameProps.Player2.value.y
        // ) {
        //     // Ball collided with Player2, reverse its horizontal velocity
        //     gameProps.Ball.value.velocityX = -gameProps.Ball.value.velocityX;
        // }

        // //Goal scenario 
        // //TODO : Refactor into round end function
        // if ((gameProps.Ball.value.x > stateProps.canvas.value.width + gameProps.Ball.value.width || gameProps.Ball.value.x < 0 - gameProps.Ball.value.width) || gameProps.newRound.value === true)
        // {
        //     if (gameProps.newRound.value === false)
        //     {
        //         console.log('new round !')
        //         socket.emit('newRound', {
        //             player: auth.session.username
        //         })
        //     }
        //     let roundWinner = ''
        //     if(gameProps.Ball.value.x > stateProps.canvas.value.width)
        //         roundWinner = gameProps.Player1.value.name
        //     else
        //         roundWinner = gameProps.Player2.value.name
    
        //     gameProps.Ball.value.x = stateProps.canvas.value.width / 2 - 10;
        //     gameProps.Ball.value.y = stateProps.canvas.value.height / 2 - 10;
        //     gameProps.Ball.value.velocityX = 0;
        //     gameProps.Ball.value.velocityY = 0;

        //     // setTimeout(() => {
        //         // if (gameProps.newRound.value === true)
        //         // {
        //             gameProps.Ball.value.velocityX = 5 * gameProps.initialDirection.value ;
        //             gameProps.Ball.value.velocityY = 5 * gameProps.initialDirection.value ;
        //             gameProps.newRound.value = false
        //         // }
        //         // else
        //         // {
        //         //     gameProps.Ball.value.velocityX = 5 * gameProps.initialDirection.value * -1;
        //         //     gameProps.Ball.value.velocityY = 5 * gameProps.initialDirection.value;
        //         // }
        //     // }, 1000)
        //     await new Promise (timeout => setTimeout(timeout, 1000))
        //     //TODO : score are reversed
        //     if (roundWinner === gameProps.Player1.value.name)
        //     {
        //         gameProps.Player1.value.score++;
        //         if (gameProps.Player1.value.score === 5)
        //         {
        //             console.log("app.vue: Player 1 Win !")
        //             finishGame('P1');
        //             return ;
        //         }
        //     }
        //     else
        //     {
        //         gameProps.Player2.value.score++;
        //         if (gameProps.Player2.value.score === 5)
        //         {
        //             console.log("app.vue: Player 2 Win !")
        //             finishGame('P2');
        //             return ;
        //         }
        //     }
        //     //TODO : fix velocity difference on small canvas
        //     //check if still in gameloop, else return


        // }

        gameProps.refreshCanvas()
        stateProps.animationFrameId.value = requestAnimationFrame(gameProps.gameLoop);
    },

    refreshGameSession: async () => {
        //TODO : Put this call into a function
        // const { data, error }:any = await useRequest('/matchmaking/getPlayersInGame', {
        //     method: 'POST',
        //     body: {
        //             playerId: auth.session.id,
        //     },
        // })
        // if (error.value?.statusCode || data.value === null) {
        //     alert(`refreshGameSession: Game Lobby no longer exists for player ${auth.session.username}`)
        //     auth.error = error.value?.statusMessage as string
        //     return null
        // }
  
        // console.log('refreshGameSession: Found existing Game Lobby for player ', auth.session.username)
        // gameProps.Player1.value.name = data.value.player1Name;
        // gameProps.Player2.value.name = data.value.player2Name;
        // gameProps.Player1.value.score = data.value.player1Score;
        // gameProps.Player2.value.score = data.value.player2Score;
        // gameProps.gameStatus.value = 'running';

        console.log('refreshGameSession: Updated chat status to INGAME for player ', auth.session.username)
        socket.emit('chatStatus', {
            sender: auth.session.username,
            text: 'INGAME',
        });
    },
  };

  useHead({
    title: appName,
  })

  onBeforeMount(() => {
    isLoading.value = true;
  });

  onBeforeUnmount(() => {
        socket.disconnect()
        console.log('onBeforeUnMount: Socket.io DISCONNECTED')
  })
  
  onMounted(async() => {
    isLoading.value = false;
    await auth.refreshSession();
    await socket.connect()
    console.log('onMounted: Socket.io CONNECTED')

    socket.on('newRoundResponse', (data:any) => {
        if (data.player !== auth.session.username)
        {
            gameProps.newRound.value = true
        }
        console.log(gameProps.initialDirection.value)
    })

    socket.on('readyForMatchmakingResponse', (data:any) => {
        stateProps.gameLobbyId.value = data.lobbyId
    })

    socket.on('getGameStateResponse', (data:any) => {
        console.log('return of getGameStateResponse : ')
        console.log(data.gameState)
        gameProps.gameState.value = data.gameState
    })
  });
</script>

<template>
  <div class="min-w-600px min-h-400px">
    <transition name="fade" mode="out-in">
      <div v-if="isLoading" key="loading" class="min-h-screen bg-zinc-800 flex flex-col items-center justify-center">
        <div>
          <p class="text-7xl text-center font-bold text-zinc-200 m-4">transcendence</p>
          <p class="text-xl text-center text-zinc-400 mb-4">Loading...</p>
        </div>
        <div class="flex justify-center items-center animate-bounce h-[12px] w-[12px] bg-zinc-200 rounded-full"></div>
      </div>
    </transition>
    <div v-if="!isLoading" key="content" id="haha">
      <NuxtLayout :stateProps="stateProps" :gameProps="gameProps">
            <NuxtPage :stateProps="stateProps" :gameProps="gameProps"/>
      </NuxtLayout>
    </div>
  </div>
</template>

<style>
  /* Define the fade transition */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }

  /* Rest of your styles */
  html, body, #__nuxt {
    height: 100vh;
    margin: 0;
    padding: 0;
  }

  html.dark {
    background: #000;
    color: white;
  }
</style>
