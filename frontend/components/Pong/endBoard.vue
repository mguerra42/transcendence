<script setup lang="ts">

const showProfile = ref(false)
const auth = useAuth()
const socket = useSocket()
const friend = useFriend()
const client = useClient()
const winner = ref('')
const loser = ref('')

const winnerElo = ref(0)
const loserElo = ref(0)
const { stateProps, gameProps } = defineProps<{
    stateProps: any
    gameProps: any
}>()

const closeEndGame = () => {
  stateProps.showEndGame.value = false;
}


const addFriend = async (newFriendUsername: string) => {
    await client.friend.add(newFriendUsername);
    socket.emit('refreshUserProfile', {
        currentUserId: auth.session.id,
        otherUserId: client.chat.chatState.receiver.id
    })
};


onMounted(() => {
  if (gameProps.gameState.value.playerOneScore === 5){
      winner.value = gameProps.gameState.value.playerOneName
      loser.value = gameProps.gameState.value.playerTwoName
      winnerElo.value = gameProps.gameState.value.playerOneProfile.ladderPoint
      loserElo.value = gameProps.gameState.value.playerTwoProfile.ladderPoint
  }
  else {
    winner.value = gameProps.gameState.value.playerTwoName
    loser.value = gameProps.gameState.value.playerOneName
    winnerElo.value = gameProps.gameState.value.playerOneProfile.ladderPoint
    loserElo.value = gameProps.gameState.value.playerTwoProfile.ladderPoint
  }
})
</script>

<template>
  <div class="flex w-90 bg-zinc-700 items-center justify-center rounded-lg">
    <div class="flex-col m-3">
      <p class="text-zinc-200  text-5xl font-bold text-center">
        {{ (winner === auth.session.username) ? 'You win 😎' : 'You lose 😪'}}
      </p>

      <div class="flex w-70 h-50 m-3 rounded-lg">
        <div class="w-2/5 flex-col">
          <div class="flex justify-center">
            <img v-if="winner === gameProps.gameState.value.playerOneName" :src="gameProps.gameState.value.playerOneProfile.avatarPath" class="w-20 h-20 border-4 border-zinc-100 rounded-full justify-center" />
            <img v-else :src="gameProps.gameState.value.playerTwoProfile.avatarPath" class="w-20 h-20 border-4 border-zinc-100 rounded-full justify-center" />
          </div>

          <p class="flex justify-center text-lg m-1">Winner</p>
          <p class="flex justify-center text-xs m-1"> LP : {{ winnerElo }}</p>
          <button v-if="winner !== auth.session.username" @click="addFriend(winner)" class="rounded bg-zinc-600 px-2 py-1 text-zinc-200" >
            <p class="text-xs">Send a friend request</p>
          </button>
        </div>

        <div class="w-1/5"></div>

        <div class="w-2/5">
          <div class="flex justify-center">
            <img v-if="loser === gameProps.gameState.value.playerOneName" :src="gameProps.gameState.value.playerOneProfile.avatarPath" class="w-20 h-20 border-4 border-zinc-100 rounded-full justify-center" />
            <img v-else :src="gameProps.gameState.value.playerTwoProfile.avatarPath" class="w-20 h-20 border-4 border-zinc-100 rounded-full justify-center" />
          </div>
        
          <p class="flex justify-center text-lg m-1">Defeated</p>
          <p v-if="stateProps.opponentForfeit.value" class="flex justify-center text-xs m-1 bg-zinc-600 rounded-lg px-2 py-1 text-zinc-400">Forfeit</p>
          <p class="flex justify-center text-xs m-1"> LP : {{ loserElo }}</p>
          <button v-if="loser !== auth.session.username" @click="addFriend(loser)" class="rounded bg-zinc-600 px-2 py-1 text-zinc-200" >
            <p class="text-xs">Send a friend request</p>
          </button>
        </div>

      </div>
      <!-- <div class="flex justify-center m-4">
        <img v-if="winner === gameProps.gameState.value.playerOneName" :src="gameProps.gameState.value.playerOneProfile.avatarPath" class="w-20 h-20 border-4 border-zinc-100 rounded-full justify-center" />
        <img v-else :src="gameProps.gameState.value.playerTwoProfile.avatarPath" class="w-20 h-20 border-4 border-zinc-100 rounded-full justify-center" />
      </div> -->
      <!-- <div class="rounded-lg w-70 py-2 bg-zinc-600">
        <p class="text-zinc-200  text-5xl font-bold text-center">
          {{ (winner === auth.session.username) ? 'You win !' : 'You lose 😪'}}
        </p>
        
      </div>

      <div class="flex m-2 justify-center">
        <div class="w-1/3">
          <p class="text-zinc-300 rounded bg-zinc-600 text-xs">+20 elo</p>
          {{ winner }} {{ winner === auth.session.username ? '(You)' : '' }} 
          <br/>
          <button v-if="winner !== auth.session.username" @click="addFriend(winner)" class="rounded bg-zinc-600 text-zinc-200" >
            <p class="text-xs">Add to friendlist</p>
          </button>
        </div>
        <div class="w-1/3 ml-6 mr-6">
        </div>
        <div class="w-1/3">
          <p class="text-zinc-300 rounded bg-zinc-600 text-xs">-20 elo</p>
          {{ loser }} {{ loser === auth.session.username ? '(You)' : '' }}
          <br/>
          <button v-if="loser !== auth.session.username" @click="addFriend(loser)" class="rounded m-2 bg-zinc-600 text-zinc-200" >
            <p class="m-2 text-xs">Add to friendlist</p>
          </button>
        </div>
      </div>
    -->
    <div class="flex justify-center">
      <button @click="closeEndGame" class="rounded bg-zinc-600 m-2 px-4 py-1 text-zinc-200" >Close</button>
    </div> 
    
    </div>
  </div>
</template>
