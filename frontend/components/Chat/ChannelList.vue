<script setup lang="ts">
const client = useClient()
const auth = useAuth()
const socket = useSocket()
const channel = useChannel()

channel.allChannelArray = [];

const isInChannel = (channelName : string) => {
  for (let i = 0; i < client.chat.channelArray.length; i++) {
    if (client.chat.channelArray[i].name == channelName) {
      return true;
    }
  }
  return false;
}

const joinChannel = async (channelList : any) => {
    let password = null;
    if (channelList.access == 'PROTECTED' && isInChannel(channelList.name) == false) {
      password = prompt('Enter password');
    }
    socket.emit('joinChannel', {
      sender: auth.session.username,
      receiver: channelList.name,
      password: password,
    });
    setTimeout(() => {}, 200);
    await channel.refresh();
    //console.log(client.chat.channelArray);
    for (let i = 0; i < client.chat.channelArray.length; i++) {
      if (client.chat.channelArray[i].name == channelList.name) {
        client.chat.messages = [];
        client.chat.chatState.select = 'CHANNEL';
        client.chat.chatState.receiver.id = channelList.id;
        client.chat.chatState.receiver.name = channelList.name;
        client.chat.chatState.receiver.access = channelList.access;
        client.chat.messages = await client.chat.currentHistory();
        socket.emit('refresh', { channelId: client.chat.chatState.receiver.id }) 
      }
    }
  };

  onMounted(async () => {
    channel.allChannelArray = await channel.getAllChannels();
  })


</script>

<template>
    <div class="bg-zinc-700 rounded flex-col p-1">
        <div class="p-2 h-[1/5] w-full 0 flex mr-auto mb-2 text-left text-lg text-zinc-200 font-bold cursor-pointer justify-between">
            Available channels
        </div>
        <div v-for="channelList in channel.allChannelArray" class="bg-zinc-700 cursor-pointer hover:bg-zinc-600 rounded flex mb-2" >
          <!-- CHANNELS PUBLIC -->
          <button v-if="channelList.access == 'PUBLIC'" @click="joinChannel(channelList)" class="bg-zinc-600  hover:bg-zinc-800 rounded px-2 py-2 w-full text-sm text-left text-zinc-200 cursor-pointer':user.status flex">
                  #{{ channelList.name }}
                </button>

          <!-- CHANNELS PROTECTED -->
          <button v-if="channelList.access == 'PROTECTED'" @click="joinChannel(channelList)" class="bg-zinc-600  hover:bg-zinc-800 rounded px-2 py-2 w-full text-sm text-left text-zinc-200 cursor-pointer':user.status flex">
            #{{ channelList.name }} 
              <div class="i-mdi:lock ml-2"></div>
          </button>   

          <!-- CHANNELS PRIVATE -->
          <!-- not invited -->
          <button v-if="channelList.access == 'PRIVATE' && channelList.id == -1" class="bg-zinc-600  hover:bg-zinc-800 rounded px-2 py-2 w-full text-sm text-left text-zinc-200 cursor-pointer':user.status flex">
            #{{ channelList.name }} 
              <div class="i-mdi:email-lock ml-2"></div>
          </button>

          <!-- invited -->
          <button v-if="channelList.access == 'PRIVATE' && channelList.id > 0" @click="joinChannel(channelList)" class="bg-zinc-600  hover:bg-zinc-800 rounded px-2 py-2 w-full text-sm text-left text-zinc-200 cursor-pointer':user.status flex">
            #{{ channelList.name }} 
              <div class="i-mdi:email-check-outline ml-2"></div>
          </button>
          
        </div>
    </div>
</template>