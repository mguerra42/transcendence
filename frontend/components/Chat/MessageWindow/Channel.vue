<script setup lang="ts">
  const client = useClient();
  const auth = useAuth();
  client.chat.showUserProfile = false;
  const isTooltipVisible = ref(false);
  const tooltipX = ref(0);
  const tooltipY = ref(0);

  const hideTooltip = () => {
    if (isTooltipVisible.value == true)
      isTooltipVisible.value = false;
  }

  const displayUserTooltip = (event: MouseEvent) => {
    // Calculate the position of the parent div (adjust this as needed)
    const parentDiv = event.target as HTMLElement;
    const parentRect = parentDiv.getBoundingClientRect();
    
    // Set the tooltipX and tooltipY values relative to the parent div's position
    tooltipX.value = parentRect.left + 20;
    tooltipY.value = parentRect.top + parentRect.height - 260;

    // Show the tooltip
    if (isTooltipVisible.value === true)
      isTooltipVisible.value = false;
    else
      isTooltipVisible.value = true;
  }

  const displayUserProfile = (user:any, event:any) => {
    
    isTooltipVisible.value = false;
    client.chat.showUserProfile = !client.chat.showUserProfile;
    client.chat.chatState.receiver.avatarPath = user.avatarPath;
    client.chat.chatState.receiver.username = user.username;
    // Prevent the click event from propagating to the document
    event.stopPropagation();
  }

  onMounted(() => {
    document.addEventListener('click', hideTooltip);
  });

  // Remove the click event listener when the component is unmounted
  onBeforeUnmount(() => {
    document.removeEventListener('click', hideTooltip);
  });
</script>

<style>
  .tooltip {
    position: absolute;
    /* Other tooltip styles here */
  }
</style>

<template>

    <div v-if="client.chat.chatState.select === 'CHANNEL'" class="p-2 h-[1/5] w-full bg-zinc-600 hover:bg-zinc-500 rounded-lg flex mr-auto mb-2 cursor-pointer">
          <div class="flex flex-col justify-center">
            <!-- <img :src="client.chat.chatState.receiver.avatarPath" class="w-10 h-10 rounded-full" /> -->
          </div>
          <div class="flex flex-col justify-center">
            <p class="ml-3 text-lg text-zinc-200 font-bold" >#{{ client.chat.chatState.receiver.name }}</p>
            <p class="ml-3 text-xs text-zinc-400" >Subscribed : {{ client.chat.chatState.receiver.userCount }} users</p>
            <p class="ml-3 text-xs text-zinc-400" >Online : {{ client.chat.chatState.receiver.onlineUsers }} users</p>
          </div>
        </div>
        <div id="chatMessages" ref="chatMessages" class="overflow-y-auto max-w-full scrollbar-w-2 h-[3/5] px-1 rounded-lg">
          <div class="flex flex-col">
            <div v-if="client.chat.chatState.select === 'CHANNEL'" v-for="message in client.chat.messages" class="mb-1">
              <div class="text-left">
                <div class="flex flex-col justify-center w-full hover:bg-zinc-600 rounded inline-block p-1">
                  <div class="flex">
                    <div class="flex flex-col justify-center cursor-pointer">
                      <p @click.stop="displayUserTooltip($event)" class="text-xs text-zinc-400"> {{ message.sender }} </p>
                    </div>
                      <div
                        v-if="isTooltipVisible"
                        class="tooltip w-30 h-40 shadow-md bg-zinc-800 px-2 py-1 rounded text-black"
                        :style="{ top: `${tooltipY}px`, left: `${tooltipX}px`, 'z-index': 9999}"
                        >
                        <p @click="displayUserProfile(message.user, $event)" class="text-center cursor-pointer text-zinc-200 px-2 py-1 m-1 bg-zinc-700 rounded hover:bg-zinc-600">
                          {{message.sender}}
                        </p>
                      </div>
                    <div class="flex flex-col justify-center" >
                       <p class="text-xs ml-1 text-zinc-400"> - {{ message.time }} </p>
                    </div>
                  </div>
                  <p class="text-sm text-zinc-300 break-all">
                    {{ message.text }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
</template>

