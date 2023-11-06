

<template>
  <PongMatchmaking :state-props="stateProps" :game-props="gameProps"/>
  <Pong v-if="auth.logged" :state-props="stateProps" :game-props="gameProps"/>
  <PongEndBoard v-if="stateProps.showEndGame.value === true" :state-props="stateProps" :game-props="gameProps" />
</template>

<script setup lang="ts">
    const auth = useAuth()
    const client = useClient()
    const socket = useSocket()

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

      socket.on('getGameStateResponse', (data:any) => {
          if (stateProps.gameLobbyId.value === data.gameId && data.gameState !== null){
              gameProps.gameState.value = data.gameState
              if (stateProps.endGameLoop.value !==true && gameProps.gameState.value.running === false && (gameProps.gameState.value.playerOneScore === 5 || gameProps.gameState.value.playerTwoScore === 5)){
                stateProps.endGameLoop.value = true
              }
          }
      })
    })
</script>
