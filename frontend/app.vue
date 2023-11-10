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
        
        //clean up backend
        console.log('finishGame: Game finished, removing ', auth.session.username, ' from queue and deleting lobby ', stateProps.gameLobbyId.value)
        await client.game.removeFromGameQueue(auth.session.username)
        await client.game.deleteLobbyById(stateProps.gameLobbyId.value)

        //le winner crée l'objet game dans la DB pour eviter doublon
        if (winner == 'P1' && auth.session.username == gameProps.Player1.value.name)
            await client.game.createEndGame(gameProps.Player1.value.name, gameProps.Player2.value.name, gameProps.Player1.value.score, gameProps.Player2.value.score);
        else if (winner == 'P2' && auth.session.username == gameProps.Player2.value.name)
            await client.game.createEndGame(gameProps.Player2.value.name, gameProps.Player1.value.name, gameProps.Player2.value.score, gameProps.Player1.value.score);
        //else, le user est perdant donc n'a pas a crée l'objet game.
            
        //reset frontend
        cancelAnimationFrame(stateProps.animationFrameId.value);
        gameProps.resetGame();

        stateProps.showPong.value = false;
        stateProps.showPlayButton.value = true;
        stateProps.showEndGame.value = true;
        stateProps.resetMatchmakingWindow()
        
        console.log('finishGame: Resetting chat status to ONLINE')
        socket.emit('chatStatus', {
            sender: auth.session.username,
            text: 'ONLINE',
        });
        console.log('finishGame: Reset game status')
        gameProps.gameStatus.value = '';
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
    opponentProfile: ref<{ username?: string; id?: string; socketId?: string; avatarPath?: string; }>({}),
    
    //MATCHMAKING FUNCTIONS
    waitForMatch: async() => {
        //hide play button when waiting for match
        stateProps.showPlayButton.value = false;

        //show loading screen when waiting for match
        stateProps.showLoader.value = true;

        //show loading screen when waiting for match
        stateProps.showCancelButton.value = true;

        //update time count every second
        const timeElapsedInterval = setInterval(() => {
        stateProps.timeElapsed.value++;
        }, 1000);

        //add in game queue
        await client.game.addToGameQueue(auth.session.username)
        let matchOpponent:any = null;
        let retryAttempts = 0;
        //wait for match to be found
        console.log('waitForMatch: Waiting for an opponent...')
        while (retryAttempts < 100 && matchOpponent === null && stateProps.cancelMatch.value === false)
        {
            matchOpponent = await client.game.findAMatch(auth.session.username);
            await new Promise(timeout => setTimeout(timeout, 100));
            retryAttempts++;
        }
        
        if (matchOpponent === null || stateProps.cancelMatch.value === true)
        {
            console.log('waitForMatch: Could not find an opponent')
            if (stateProps.cancelMatch.value === true)
                stateProps.MatchmakingError.value = 'You have left the queue.'
            else
                stateProps.MatchmakingError.value = 'No players available.'
            stateProps.showCancelButton.value = false
            stateProps.showMatchmakingError.value = true
            await new Promise(timeout => setTimeout(timeout, 2000));
            stateProps.showMatchmakingError.value = false
            //reset time count
            clearInterval(timeElapsedInterval);
            stateProps.timeElapsed.value = 0;
            return null;
        }
        else
        {
            console.log('waitForMatch: Found a match with ', matchOpponent.username)
            await client.game.setQueueStatus(auth.session.username, 'waiting')
            //update the opponent profile if match is found
            stateProps.opponentProfile.value.username = matchOpponent.username;
            stateProps.opponentProfile.value.avatarPath = matchOpponent.avatarPath;
            stateProps.opponentProfile.value.id = matchOpponent.id;
            stateProps.opponentProfile.value.socketId = matchOpponent.socketId;

            console.log('waitForMatch: Sending challenger socket to ', matchOpponent.username, ' with lobby ', matchOpponent.lobbyId)
            socket.emit('challengePlayer', {
                challenger: auth.session.username,
                lobbyId: matchOpponent.lobbyId
            })
            stateProps.gameLobbyId.value = matchOpponent.lobbyId
            clearInterval(timeElapsedInterval);
            stateProps.timeElapsed.value = 0;
        }
        return matchOpponent;
    },

    waitForConfirm: async () => {
        stateProps.showMatchFound.value = true;
        stateProps.timeElapsed.value = 10;
        const timeElapsedInterval = setInterval(() => {
            stateProps.timeElapsed.value--;
        }, 1000);
        stateProps.showLoader.value = false;
        await Promise.race([
            new Promise<void>(timeout => setTimeout(timeout, 10000)),
            new Promise<void>(resolve => {
                const checkMatchAccepted = () => {
                    if (stateProps.matchAccepted.value === true && stateProps.opponentAccepted.value === true)
                    {
                        resolve();
                    }
                    else if (stateProps.opponentDeclined.value === true && stateProps.matchDeclined.value === false)
                    {
                        resolve();
                    }
                    else if (stateProps.matchDeclined.value === true && stateProps.opponentDeclined.value === false)
                    {
                        resolve();
                    }
                    else
                        setTimeout(checkMatchAccepted, 100);
                };
                checkMatchAccepted();
            }),   
        ]);
        clearInterval(timeElapsedInterval);
        stateProps.timeElapsed.value = 0;
    },

    resetMatchmakingWindow: async () => {
        stateProps.showMatchFound.value = false;
        stateProps.matchAccepted.value = false;
        stateProps.matchDeclined.value = false;
        stateProps.cancelMatch.value = false;
        stateProps.opponentAccepted.value = false;
        stateProps.opponentDeclined.value = false;
    },
  };
  
  const gameProps = {
    gameStatus: ref(''),

    Player1: ref({
        name : "",
        score: 0,
        width: 15,
        height: 70,
        x: 25,
        y: 20
    }),

    Player2: ref({
        name : "",
        score: 0,
        width: 15,
        height: 70,
        x: 800 - 35,
        y: 20
    }),

    Ball: ref({
        width: 20,
        height: 20,
        x: 390,
        y: 290,
        velocityX: 5, // Horizontal velocity (positive moves right, negative moves left)
        velocityY: 5  // Vertical velocity (positive moves down, negative moves up)
    }),

    resetGame: () => {
        //TODO : reinitialize values here
    },

    player1MoveDown: (event:any) => {
        if (event.key === 'ArrowDown' && gameProps.Player1.value.y < 500) {
            gameProps.Player1.value.y += 15;
            socket.emit('playerMovement', {
                player: auth.session.username,
                move:'moveDown' 
            });
            gameProps.refreshCanvas();
        }
    },

    player1MoveUp: (event:any) => {
        if (event.key === 'ArrowUp' && gameProps.Player1.value.y > 20) {
            gameProps.Player1.value.y -= 15;
            socket.emit('playerMovement', {
                player: auth.session.username,
                move:'moveUp' 
            });
            gameProps.refreshCanvas();
        }
    },

    player2MoveDown: () => {
        if(gameProps.Player2.value.y < 500)
            gameProps.Player2.value.y += 20;
        gameProps.refreshCanvas();
    },

    player2MoveUp: () => {
        if(gameProps.Player2.value.y > 20)
            gameProps.Player2.value.y -= 20;
        gameProps.refreshCanvas();
    },

    refreshCanvas: () => {
        stateProps.context.value.clearRect(0, 0, stateProps.canvas.value.width, stateProps.canvas.value.height);
        stateProps.context.value.fillRect(gameProps.Player1.value.x, gameProps.Player1.value.y, gameProps.Player1.value.width, gameProps.Player1.value.height);
        stateProps.context.value.fillRect(gameProps.Player2.value.x, gameProps.Player2.value.y, gameProps.Player2.value.width, gameProps.Player2.value.height);
        stateProps.context.value.fillRect(gameProps.Ball.value.x, gameProps.Ball.value.y, gameProps.Ball.value.width, gameProps.Ball.value.height)
    },

    gameLoop: () => {
        // Update the Ball's position based on its velocity
        gameProps.Ball.value.x += gameProps.Ball.value.velocityX;
        gameProps.Ball.value.y += gameProps.Ball.value.velocityY;
        
        // Check for collision with Player1
        if (
            gameProps.Ball.value.x < gameProps.Player1.value.x + gameProps.Player1.value.width &&
            gameProps.Ball.value.x + gameProps.Ball.value.width > gameProps.Player1.value.x &&
            gameProps.Ball.value.y < gameProps.Player1.value.y + gameProps.Player1.value.height &&
            gameProps.Ball.value.y + gameProps.Ball.value.height > gameProps.Player1.value.y
        ) {
            // Ball collided with Player1, reverse its horizontal velocity
            gameProps.Ball.value.velocityX = -gameProps.Ball.value.velocityX;
        }

        // Check for collision with Player2
        if (
            gameProps.Ball.value.x < gameProps.Player2.value.x + gameProps.Player2.value.width &&
            gameProps.Ball.value.x + gameProps.Ball.value.width > gameProps.Player2.value.x &&
            gameProps.Ball.value.y < gameProps.Player2.value.y + gameProps.Player2.value.height &&
            gameProps.Ball.value.y + gameProps.Ball.value.height > gameProps.Player2.value.y
        ) {
            // Ball collided with Player2, reverse its horizontal velocity
            gameProps.Ball.value.velocityX = -gameProps.Ball.value.velocityX;
        }

        //Bounds collission
        //TODO : Refactor into round end function
        if (gameProps.Ball.value.x >780 || gameProps.Ball.value.x < 0)
        {
            let roundWinner = ''
            if(gameProps.Ball.value.x > 700)
                roundWinner = 'P1'
            else
                roundWinner = 'P2'
    
            gameProps.Ball.value.x = 390;
            gameProps.Ball.value.y = 290;
            gameProps.Ball.value.velocityX = 0;
            gameProps.Ball.value.velocityY = 0;

            setTimeout(() => {
                //TODO : Put this in backend and call it on gamestart
                const randomDirectionX = Math.random() > 0.5 ? 1 : -1; // Randomly choose 1 or -1
                const randomDirectionY = Math.random() > 0.5 ? 1 : -1; // Randomly choose 1 or -1

                gameProps.Ball.value.velocityX = 5 ;
                gameProps.Ball.value.velocityY = 5 ;
            }, 1000)
            
            if (roundWinner === 'P1')
            {
                gameProps.Player1.value.score++;
                if (gameProps.Player1.value.score === 5)
                {
                    console.log("app.vue: Player 1 Win !")
                    finishGame('P1');
                    return ;
                }
            }
            else
            {
                gameProps.Player2.value.score++;
                if (gameProps.Player2.value.score === 5)
                {
                    console.log("app.vue: Player 2 Win !")
                    finishGame('P2');
                    return ;
                }
            }
        }
        
        //Ground/Ceiling collision
        if (gameProps.Ball.value.y >580 || gameProps.Ball.value.y < 0)
        {
            gameProps.Ball.value.velocityY = gameProps.Ball.value.velocityY * -1;
        }

        // Clear and redraw the Ball on the canvas
        stateProps.context.value.fillStyle = "blue";
        stateProps.context.value.clearRect(0, 0, stateProps.canvas.value.width, stateProps.canvas.value.height);
        stateProps.context.value.fillRect(gameProps.Player1.value.x, gameProps.Player1.value.y, gameProps.Player1.value.width, gameProps.Player1.value.height);
        stateProps.context.value.fillRect(gameProps.Player2.value.x, gameProps.Player2.value.y, gameProps.Player2.value.width, gameProps.Player2.value.height);
        stateProps.context.value.fillRect(gameProps.Ball.value.x, gameProps.Ball.value.y, gameProps.Ball.value.width, gameProps.Ball.value.height);
        // Call the game loop recursively
        stateProps.animationFrameId.value = requestAnimationFrame(gameProps.gameLoop);
    },

    refreshGameSession: async () => {
        //TODO : Put this call into a function
        const { data, error }:any = await useRequest('/matchmaking/getPlayersInGame', {
            method: 'POST',
            body: {
                    playerId: auth.session.id,
            },
        })
        if (error.value?.statusCode || data.value === null) {
            alert(`refreshGameSession: Game Lobby no longer exists for player ${auth.session.username}`)
            auth.error = error.value?.statusMessage as string
            return null
        }
  
        console.log('refreshGameSession: Found existing Game Lobby for player ', auth.session.username)
        gameProps.Player1.value.name = data.value.player1Name;
        gameProps.Player2.value.name = data.value.player2Name;
        gameProps.Player1.value.score = data.value.player1Score;
        gameProps.Player2.value.score = data.value.player2Score;
        gameProps.gameStatus.value = 'running';

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
  });
</script>

<template>
  <div>
    <transition name="fade" mode="out-in">
      <div v-if="isLoading" key="loading" class="min-h-screen bg-zinc-800 flex flex-col items-center justify-center">
        <div>
          <p class="text-7xl text-center font-bold text-zinc-200 m-4">transcendence</p>
          <p class="text-xl text-center text-zinc-400 mb-4">Loading...</p>
        </div>
        <div class="flex justify-center items-center animate-bounce h-[12px] w-[12px] bg-zinc-200 rounded-full"></div>
      </div>
    </transition>
    <div v-if="!isLoading" key="content">
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
