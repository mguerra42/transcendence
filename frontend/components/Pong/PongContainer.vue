

<template>
  <PongMatchmaking :state-props="stateProps" :game-props="gameProps"/>
  <Pong v-if="auth.logged" :state-props="stateProps" :game-props="gameProps"/>
  <PongEndBoard v-if="stateProps.showEndGame.value === true" :state-props="stateProps" :game-props="gameProps" />
  <div v-if="showGameInvite">
    <div class="absolute top-0 bottom-0 left-0 right-0 z-10 flex justify-center items-center bg-black/60 backdrop-blur-sm" >
            <div class="w-80 bg-zinc-800 p-6 rounded-lg flex-col items-center justify-center relative">
                <div class="flex justify-center p-2 ">
                    <img :src="challenger.avatarPath" class="w-16 h-16 rounded-full" />
                </div>
                <div v-if="!matchAccepted">
                    <div v-if="!showInviteExpired">
                        <p class="text-center"> <span class="font-bold">{{ challenger.username }}</span> wants to challenges you to a friendly match !</p>
                        <div class="flex m-1 items-center justify-center">
                            <button @click="respondToGameInvite(true)" class="w-1/3 rounded m-2 bg-zinc-600">Accept</button>
                        </div>
                        <div class="flex items-center justify-center">
                            <button @click="respondToGameInvite(false)" class="w-1/3 rounded m-2 bg-zinc-600">Decline</button>
                        </div>
                    </div>
                    <div v-else>
                        <p class="text-center">Invitation expired.</p>
                    </div>
                </div>
                <div v-if="showFriendlyMatchPrep">
                    <p v-if="!cancelFriendlyMatch" class="text-center">Waiting for game start...</p>
                    <p class="text-center"> {{ timeElapsed }} </p>
                    <p v-if="cancelFriendlyMatch" class="text-center">Match cancelled by challenger.</p>
                    <div class="flex items-center justify-center">
                            <button @click="cancelMatchInvitation" class="w-1/3 rounded m-2 bg-zinc-600">Cancel</button>
                    </div>
                </div>
            </div>
    </div>
  </div>
</template>

<script setup lang="ts">
    const auth = useAuth()
    const client = useClient()
    const socket = useSocket()
    const timeElapsed = ref(0)
    const cancelFriendlyMatch = ref(false)
    const matchAccepted = ref(false)
    const showGameInvite = ref(false)
    const showInviteExpired = ref(false)
    const showFriendlyMatchPrep = ref(false)
    let challenger:any;

    const cancelMatchInvitation = () => {
        socket.emit('cancelFriendlyMatch', {opponent: challenger})
        cancelFriendlyMatch.value = false
        showGameInvite.value = false
        showFriendlyMatchPrep.value = false
        matchAccepted.value = false
    }

    const respondToGameInvite = async (response: Boolean) => {
        if (response === true){
            socket.emit("acceptGameInvite", {
                challenged: auth.session.username
            })
            showFriendlyMatchPrep.value = true
            matchAccepted.value = true
        }
        else {
            socket.emit("declineGameInvite", {
                challenged: auth.session.username
            })
            showGameInvite.value = false
        }
    }

    const { stateProps, gameProps } = defineProps<{
        stateProps: any,
        gameProps: any
    }>();
  
    onBeforeUnmount(() => {
        socket.disconnect()
        console.log('onBeforeUnMount: Socket.io DISCONNECTED')
    })
  
    onMounted(async () => {
      await socket.connect()
      console.log('onMounted: Socket.io CONNECTED')

      //RANKED MATCHMAKING

      socket.on('matchmakingConfirmResponse', (data: any) => {
            if (data.lobby === stateProps.gameLobbyId.value && data.player !== auth.session.username)
            {
                if (data.confirm === 'decline')
                    stateProps.opponentDeclined.value = true;
                if (data.confirm === 'accept')
                    stateProps.opponentAccepted.value = true;
            }
      });

      socket.on('readyForMatchmakingResponse', (data:any) => {
        if (auth.session.username === data.player1 || auth.session.username === data.player2){
            stateProps.gameLobbyId.value = data.lobbyId
        }
      })

      //IN-GAME 

      socket.on('getGameStateResponse', (data:any) => {
          if (stateProps.gameLobbyId.value === data.gameId && data.gameState !== null){
            console.log("gamestate reeived : ", data.gameState)
              gameProps.gameState.value = data.gameState
              if (stateProps.endGameLoop.value !==true && gameProps.gameState.value.running === false && (gameProps.gameState.value.playerOneScore === 5 || gameProps.gameState.value.playerTwoScore === 5)){
                stateProps.endGameLoop.value = true
              }
          }
      })

      socket.on('resumeGameResponse', (data:any) => {
            if (data !== null)
            {
                gameProps.gameState.value = data.gameState
                stateProps.gameLobbyId.value = data.gameId
            }
        })

      socket.on('quitMatchButtonResponse', async (data: any) => {
            if (data.player !== auth.session.username && data.lobbyId === stateProps.gameLobbyId.value)
            {
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
                
                stateProps.resetMatchmakingWindow()
                stateProps.gameLobbyId.value = ""
                
                console.log('socketquitMatchButtonResponse: Resetting chat status to ONLINE')
                socket.emit('chatStatus', {
                    sender: auth.session.username,
                    text: 'ONLINE',
                });

                stateProps.showPong.value = false;
            }
        });


      socket.on('opponentForfeitResponse', (data:any) => {
            if (data.lobbyId === stateProps.gameLobbyId.value){
                stateProps.endGameLoop.value = true
                stateProps.opponentForfeit.value = true
            }
        })

      //GAME INVITE

      socket.on('sendGameInviteResponse', (data:any) => {
        if (data.opponent === auth.session.username){
            //reset

            showGameInvite.value = false
            showFriendlyMatchPrep.value = false
            matchAccepted.value = false
            client.chat.chatVisible = false
            client.chat.showUserProfile = false

            //start
            showGameInvite.value = true
            challenger = data.challenger
        }
      })

      socket.on('startFriendlyMatchCountdownResponse', async (data:any) => {
        if (data.opponent === auth.session.username){
            timeElapsed.value = 5;
            const timeElapsedInterval = setInterval(() => {
                timeElapsed.value--;
            }, 1000);


            socket.emit('getGameState', {
                    gameId: stateProps.gameLobbyId.value
            })

            await client.waitDuration(5000)
            clearInterval(timeElapsedInterval)
            timeElapsed.value = 0

            stateProps.showPong.value = true;
            stateProps.showPlayButton.value = true;
            stateProps.endGameLoop.value = false;
            stateProps.showQuitGame.value = false
        
            gameProps.gameStatus.value = 'running';
            socket.emit('chatStatus', {
                sender: auth.session.username,
                text: 'INGAME',
            });
            gameProps.gameLoop();
            showGameInvite.value = false
            showFriendlyMatchPrep.value = false
            matchAccepted.value = false
            client.chat.chatVisible = false
            client.chat.showUserProfile = false
        }
      })

      socket.on('cancelFriendlyMatchResponse', async (data:any) => {
        if (data.opponent === auth.session.username){
            cancelFriendlyMatch.value = true
            await client.waitDuration(2000)
            showGameInvite.value = false
            showFriendlyMatchPrep.value = false
            matchAccepted.value = false
        }
      })

      socket.on('inviteExpiredResponse', async (data:any) => {
        if (data.opponent === auth.session.username && showGameInvite.value === true){
            showInviteExpired.value = true
            await client.waitDuration(2000)
            showInviteExpired.value = false
            showGameInvite.value = false
        }

      })
    })
</script>
