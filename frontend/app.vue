<script setup lang="ts">
  import { getDefaultCompilerOptions } from 'typescript';
import { appName } from '~/constants'
import UserProfile from './components/Chat/UserProfile.vue';
  const isLoading = ref(true);
  
  //STORES
  const auth = useAuth()
  const client = useClient()
  const socket = useSocket()

  interface UserProfile {
    defeats?: number;
    victories?:number;
    email?: string;
    id?: number;
    ladderPoint?: number;
    secret?:string;
    socketId?:string;
    status?:string;
    twoFa?:number;
    password?: string;
    username?: string;
    avatarPath?: string;
  }

  //TODO : matchmaking sometimes doesnt work on first try when first laucnhing the window
  //TODO : implement refresh logic to persist and resume ongoign games
  //TODO : implement cleanup logic to kill inactive/dropped lobbies
  //TODO : slight refactor queue sysytem
  

  //STATIC FUNCTION
  const finishGame = async () => {
        cancelAnimationFrame(stateProps.animationFrameId.value);
        stateProps.showPong.value = false;
        
        socket.emit('deleteGameSession', {
          gameId: stateProps.gameLobbyId.value
        })
        
        stateProps.showEndGame.value = true;
        await client.waitDuration(5000)
        stateProps.showEndGame.value = false;
        
        await client.game.removeFromGameQueue(auth.session.username)
        
        stateProps.resetMatchmakingWindow()
        stateProps.gameLobbyId.value = ""

        console.log('finishGame: Reset game status')
        gameProps.gameStatus.value = '';
        console.log('finishGame: Resetting chat status to ONLINE')
        socket.emit('chatStatus', {
            sender: auth.session.username,
            text: 'ONLINE',
        });

        client.game.gameArray = await client.game.getGameArray();
  }
  //PROPS
  const stateProps = {

    //MISC. VARIABLES
    canvas: ref(),
    canvasMode: ref('BIG'),
    context: ref(),
    timeElapsed: ref(0),
    activeGameSessions: ref(0),
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
        gameProps.resetGameState()

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
                await client.waitDuration(100)
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

        stateProps.timeElapsed.value = 0;
        stateProps.showPlayButton.value = true;
    },
  };
  
  const gameProps = {
    gameStatus: ref(''),
    
    gameDimensions: ref({
        playerOneWidth: 14,
        playerTwoWidth: 14,
        playerOneHeight: 70,
        playerTwoHeight: 70,
        ballSize: 20,
        playerOneXPos: 20,
        playerTwoXPos: 800 - 35,
        canvasWidth: 800,
        canvasHeight: 600,
    }),

    gameState: ref({
        running : false,
        playerOneProfile : UserProfile,
        playerTwoProfile : UserProfile,
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
        x: 0,
        y: 0
    }),

    Player2: ref({
        x: 0,
        y: 0
    }),

    Ball: ref({
        x: 0,
        y: 0,
        velocityX: 5, // Horizontal velocity (positive moves right, negative moves left)
        velocityY: 5  // Vertical velocity (positive moves down, negative moves up)
    }),

    player1MoveDown: (event:any) => {
        socket.emit('playerMovement', {
            player: auth.session.username,
            gameId: stateProps.gameLobbyId.value,
            move: 'DOWN'
        });
    },

    player1MoveUp: (event:any) => {
        socket.emit('playerMovement', {
            player: auth.session.username,
            gameId: stateProps.gameLobbyId.value,
            move: 'UP'
        });
    },

    resetGameState : () => {
        gameProps.gameState.value.running = false
        gameProps.gameState.value.playerOneProfile = UserProfile
        gameProps.gameState.value.playerTwoProfile = UserProfile
        gameProps.gameState.value.playerOneName = ''
        gameProps.gameState.value.playerTwoName = ''
        gameProps.gameState.value.playerOnePos = 0
        gameProps.gameState.value.playerTwoPos = 0
        gameProps.gameState.value.playerOneScore = 0
        gameProps.gameState.value.playerTwoScore = 0
        gameProps.gameState.value.ballPositionX = 0
        gameProps.gameState.value.ballPositionY = 0
        gameProps.gameState.value.canvasWidth = 0
        gameProps.gameState.value.canvasHeight = 0
    },

    refreshCanvas: () => { 
      if (stateProps.canvasMode.value === 'BIG')
      {
        gameProps.Ball.value.x = gameProps.gameState.value.ballPositionX;
        gameProps.Ball.value.y = gameProps.gameState.value.ballPositionY;
        gameProps.Player1.value.y = gameProps.gameState.value.playerOnePos;
        gameProps.Player2.value.y = gameProps.gameState.value.playerTwoPos;
      }
      else
      {
        gameProps.Ball.value.x = gameProps.gameState.value.ballPositionX / 2;
        gameProps.Ball.value.y = gameProps.gameState.value.ballPositionY / 2;
        gameProps.Player1.value.y = gameProps.gameState.value.playerOnePos / 2;
        gameProps.Player2.value.y = gameProps.gameState.value.playerTwoPos / 2;  
      }

      stateProps.context.value.clearRect(0, 0, gameProps.gameDimensions.value.canvasWidth, gameProps.gameDimensions.value.canvasHeight);
      stateProps.context.value.fillRect(gameProps.gameDimensions.value.playerOneXPos, gameProps.Player1.value.y, gameProps.gameDimensions.value.playerOneWidth, gameProps.gameDimensions.value.playerOneHeight);
      stateProps.context.value.fillRect(gameProps.gameDimensions.value.playerTwoXPos, gameProps.Player2.value.y, gameProps.gameDimensions.value.playerTwoWidth, gameProps.gameDimensions.value.playerTwoHeight);
      stateProps.context.value.fillRect(gameProps.Ball.value.x, gameProps.Ball.value.y, gameProps.gameDimensions.value.ballSize, gameProps.gameDimensions.value.ballSize)
    },

    gameLoop: async () => {
        //don't enter loop if its been ended by opponent or current user
        if (stateProps.endGameLoop.value === true){
            if (gameProps.gameState.value.playerOneScore === 5 || gameProps.gameState.value.playerTwoScore === 5){
              finishGame();
            }
            return ;
        }

        //do not await this call for smooth animation
        socket.emit('getGameState', {
            gameId: stateProps.gameLobbyId.value
        })
        new Promise(timeout => setTimeout(timeout, 1000/10))

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

        // console.log('refreshGameSession: Updated chat status to INGAME for player ', auth.session.username)
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
    await socket.connect()
    console.log('onMounted: Socket.io CONNECTED')
    await auth.refreshSession();
  });
</script>

<template>
  <div class=" min-h-400px">
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
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }

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
