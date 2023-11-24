<script setup lang="ts">
const chat = useChat();
const auth = useAuth();
const query = ref("");
const results = ref([]);
//const searchChannel = async () => {
//    if(chat.searchTextChannel) {
//        results.value = await chat.searchChannel(chat.searchTextChannel)
//    } else {
//        results.value = []
//    }
//}
const isOwner = (users) => {
  return users.find((u) => u.role == "OWNER" && u.userId == auth.session.id);
};
const hasJoined = (users) => {
  return users.find((u) => u.userId == auth.session.id);
};

const leaveChannel = (channel: any) => {
  let conversation = chat.conversations.get(channel.id);
  if (conversation) {
    conversation.leave((answer) => {
      if (answer.success) {
        channel.users = channel.users.filter(
          (u) => u.userId != auth.session.id
        );
      }
    });
  }
};
//const onJoinChannel = (channel) => {
//    chat.joinChannel(channel)
//    //chat.onJoinChannel(channel.id, ()=>{
//    //    channel.users.push({
//    //        userId: auth.session.id,
//    //        role: 'USER',
//    //    })
//    //})
//    setTimeout(() => {
//        searchChannel()
//    }, 200);
//}
//const onLeaveChannel = (channel) => {
//    chat.leaveChannel(channel)
//    //chat.onJoinChannel(channel.id, ()=>{
//    //    console.log('leave')
//    //    channel.users = channel.users.filter(u => u.userId != auth.session.id)
//    //})
//    setTimeout(() => {
//        searchChannel()
//    }, 200);
//}
</script>
<template>
  <div class="overflow-auto h-full flex-1">
    <div class="flex text-white flex-1 h-full w-full">
      <div class="py-5 w-full h-full">
        <div
          class="p-2.5 flex flex-col gap-5 items-center justify-center w-full"
        >
          <div class="font-bold text-4xl">Search a friend</div>
          <div class="w-60%">
            <input
              v-model="query"
              @input="chat.searchFriend(query)"
              type="text"
              placeholder="Search a friend..."
              class="w-full px-4 py-2 text-sm rounded-lg b-1 bg-zinc-600 focus:outline-none focus:text-zinc-300"
            />
          </div>
          <div class="grid sm:grid-cols-2 gap-5 w-full">
            <div
              v-for="friend in chat.searchFriendResults"
            >
            <ChatProfileCard
              v-if="friend"
              :user="friend"
              :more="true"
              :stats="false"
             />
            </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
