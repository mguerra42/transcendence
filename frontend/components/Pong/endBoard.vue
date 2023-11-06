<script setup lang="ts">

const auth = useAuth()
const winner = ref('')
const loser = ref('')
const { stateProps, gameProps } = defineProps<{
    stateProps: any
    gameProps: any
}>()

onMounted(() => {
  if (gameProps.gameState.value.playerOneScore === 5){
      winner.value = gameProps.gameState.value.playerOneName
      loser.value = gameProps.gameState.value.playerTwoName
  }
  else {
    winner.value = gameProps.gameState.value.playerTwoName
    loser.value = gameProps.gameState.value.playerOneName
  }
})
</script>

<template>
  <div class="flex mt-3 bg-zinc-600 items-center justify-center rounded-lg">
    <div class="flex-col m-3 justify-center">
      
      <p class="text-zinc-200 ml-5 mr-5 text-5xl font-bold text-center">
        {{ (winner === auth.session.username) ? 'You win !' : winner}}{{ (winner === auth.session.username) ? '' : ' wins !' }}
      </p>
      
      <div class="flex justify-center m-4">
        <img v-if="winner === gameProps.gameState.value.playerOneName" :src="gameProps.gameState.value.playerOneProfile.avatarPath" class="w-20 h-20 border-4 border-zinc-100 rounded-full justify-center" />
        <img v-else :src="gameProps.gameState.value.playerTwoProfile.avatarPath" class="w-20 h-20 border-4 border-zinc-100 rounded-full justify-center" />
      </div>

      <div class="flex m-4">
        <div class="w-1/3 flex">
          {{ winner }} {{ winner === auth.session.username ? '(You)' : '' }}<br/> +20 elo
        </div>
        <div class="w-1/3 m-1">
        </div>
        <div class="w-1/3 flex">
          {{ loser }} {{ loser === auth.session.username ? '(You)' : '' }} <br/> -20 elo
        </div>
      </div>

    </div>
  </div>
</template>
