<template>
    <!--<div class="bg-gray flex items-center h-full justify-center flex-col">
      <PongContainer v-if="auth.logged" :gameProps="gameProps" :stateProps="stateProps"/>
    </div>-->
    <div>
        


chat.onlyChannels: {{ chat.compactMode }}
chat.onlyChannels: {{ chat.currentMode }}
    </div>
</template>

<script setup lang="ts">

const chat = useChat()
//  const auth = useAuth()
//  const { stateProps, gameProps } = defineProps<{
//    stateProps: any,
//    gameProps: any
//  }>();

//  onMounted(() => {
//  })
</script>

