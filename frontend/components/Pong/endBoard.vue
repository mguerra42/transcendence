<script setup lang="ts">
const { stateProps, gameProps } = defineProps<{
    stateProps: any
    gameProps: any
}>()
//
</script>

<template>
  <div align="center">
    THE END <br>
    <h1 v-if="gameProps.Player1.value.score === 5"><b>Winner :</b> {{ gameProps.Player1.value.name }} </h1> <h1 v-if="gameProps.Player2.value.score === 5"><b>Winner :</b> {{ gameProps.Player2.value.name }} </h1>
    <h1 v-if="gameProps.Player1.value.score !== 5"><b>Loser :</b> {{ gameProps.Player1.value.name }} </h1> <h1 v-if="gameProps.Player2.value.score !== 5"> <b>Loser :</b> {{ gameProps.Player2.value.name }} </h1>
  </div>
</template>
