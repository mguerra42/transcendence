<script setup lang="ts">

const { gameProps, stateProps } = defineProps<{
      gameProps: any,
      stateProps: any
}>();

const client = useClient();
const channel = useChannel();
const friend = useFriend();
const auth = useAuth();
const socket = useSocket();
const showWaitingForInviteResponse = ref(false)
const showStartGameCountdown = ref(false)
const gameStarting = ref(false)
const inviteResponse = ref('')
const timeElapsed = ref(0)

const displayUserProfile = async (userToMessage : any) => {
    console.log("ENTERED Friendlist/displayUserProfile");
    client.chat.showUserProfile = !client.chat.showUserProfile;
}

const chatWithUser = async (userToMessage : any) => {
    if (client.chat.chatState.receiver.id != userToMessage.id || client.chat.chatState.select != 'DM')
    {
      client.chat.messages = [];
      client.chat.chatState.select = 'DM';
      client.chat.chatState.receiver.id = userToMessage.id;
      client.chat.chatState.receiver.username = userToMessage.username;
      client.chat.messages = await client.chat.currentHistory();
      client.chat.chatState.receiver.avatarPath = userToMessage.avatarPath;
      client.chat.chatState.receiver.victories = userToMessage.victories;
      client.chat.chatState.receiver.defeats = userToMessage.defeats;
      client.chat.chatState.receiver.ladderPoint = userToMessage.ladderPoint;
      displayUserProfile(userToMessage);
    }
  };

  const addFriend = async (newFriendUsername: string) => {
    await client.friend.add(newFriendUsername);
    socket.emit('refreshUserProfile', {
        currentUserId: auth.session.id,
        otherUserId: client.chat.chatState.receiver.id
        })
  };

  const removeFriend = async (newFriendUsername: string) => {
    await client.friend.remove(newFriendUsername);
    if (client.chat.chatState.select == 'DM')
        {
          client.chat.chatState.select = '';
        }

    socket.emit('refreshUserProfile', {
        currentUserId: auth.session.id,
        otherUserId: client.chat.chatState.receiver.id
    });
    socket.emit('deletePrivateChannel', {
        currentUserId: auth.session.id,
        otherUserId: client.chat.chatState.receiver.id
    });
  };

  const sendGameInvite = async (username:string) => {
    if (client.chat.chatState.receiver.status !== 'ONLINE'){
        return ;
    }
    console.log(client.chat.chatState.receiver)
    inviteResponse.value = ''
    showWaitingForInviteResponse.value = true
    socket.emit('sendGameInvite', {
        challenger: {
            username: auth.session.username,
            avatarPath: auth.session.avatarPath,
        },
        opponent: username
    })
    timeElapsed.value = 10;
    const timeElapsedInterval = setInterval(() => {
        timeElapsed.value--;
    }, 1000);
    await client.waitDuration(10000)
    clearInterval(timeElapsedInterval)
    timeElapsed.value = 0

    socket.emit('inviteExpired', {
        opponent: username
    })
    if (inviteResponse.value === ''){
        showWaitingForInviteResponse.value = false
    }
  }

    onMounted (async () => {
    await socket.connect();
    socket.on('refreshUserProfile', async () => {
        friend.toggleCategory(client.friend.categoryName);
        if (client.chat.showUserProfile) {
            client.chat.showAdd = await friend.showAddOption(client.chat.chatState.receiver.username);
        }
        await channel.refresh();
    });

    socket.on('acceptGameInviteResponse', async (data:any) => {
        if (showWaitingForInviteResponse.value === true){
            console.log("value of gamelobby before start ", stateProps.gameLobbyId.value)
            inviteResponse.value = 'true'
            socket.emit('readyForMatchmaking', { player: auth.session.username, opponent: data.challenged, mode: 'normal' })
            await client.waitDuration(3000)
            if (stateProps.gameLobbyId.value === ""){
                socket.emit('cancelFriendlyMatch', {
                    opponent: auth.session.username
                })
                inviteResponse.value = ''
                showWaitingForInviteResponse.value = false
                return ;
            }
            else {
                showStartGameCountdown.value = true
                socket.emit('startFriendlyMatchCountdown', {
                    opponent: data.challenged
                })

                timeElapsed.value = 5;
                const timeElapsedInterval = setInterval(() => {
                    timeElapsed.value--;
                }, 1000);
                await client.waitDuration(5000)
                clearInterval(timeElapsedInterval)
                timeElapsed.value = 0
                gameStarting.value = true
                socket.emit('startGameSession', {
                    gameId: stateProps.gameLobbyId.value
                })
                socket.emit('getGameState', {
                    gameId: stateProps.gameLobbyId.value
                })
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
                gameStarting.value = false
                showStartGameCountdown.value = false
                inviteResponse.value = ''
                showWaitingForInviteResponse.value = false
                client.chat.chatVisible = false
                client.chat.showUserProfile = false
            }
            //show game prep window
            //wait ready and extra gamestart time
        }
    })

    socket.on('cancelFriendlyMatchResponse', async (data:any) => {
        if (data.opponent === auth.session.username && gameStarting.value === false){
            inviteResponse.value = 'cancelled'
            await client.waitDuration(3000)
            showWaitingForInviteResponse.value = false
        }
    })

    socket.on('declineGameInviteResponse', async (data:any) => {
        if (showWaitingForInviteResponse.value === true){
            inviteResponse.value = 'false'
            await client.waitDuration(3000)
            showWaitingForInviteResponse.value = false
        }
    })
  });
</script>

<template>
    <div v-if="showWaitingForInviteResponse" class="absolute top-0 bottom-0 left-0 right-0 z-10 flex justify-center items-center bg-black/60 backdrop-blur-sm" >
            <div class="w-80 bg-zinc-800 p-6 rounded-lg flex-col items-center justify-center relative">
                <div class="flex justify-center p-2 ">
                    <img :src="client.chat.chatState.receiver.avatarPath" class="w-16 h-16 rounded-full" />
                </div>
                <p v-if="inviteResponse === ''" class="text-center"> Invitation sent !</p>
                <p v-if="inviteResponse === ''" class="text-center"> Waiting for <span class="font-bold">{{ client.chat.chatState.receiver.username }}</span>...</p>
                <p v-if="inviteResponse === ''" class="font-bold text-center m-3"> {{ timeElapsed }}</p>
                <p v-if="inviteResponse === 'true'" class="text-center">
                    <span class="font-bold">{{ client.chat.chatState.receiver.username }}</span> accepted your invitation !
                </p>
                <p v-if="inviteResponse === 'false'" class="text-center">
                    <span class="font-bold">{{ client.chat.chatState.receiver.username }}</span> declined your invitation.
                </p>
                <p v-if="inviteResponse === 'cancelled'" class="text-center">
                    <span class="font-bold">{{ client.chat.chatState.receiver.username }}</span> cancelled the match.
                </p>
                <div v-if="showStartGameCountdown">
                    <p class="text-center m-1"> Game starting in</p>
                    <p class="text-center"> {{ timeElapsed }} </p>   
                </div>
            </div>
    </div>
    <!-- div principale -->
    <div class="w-100 bg-zinc-700 px-2 py-6 rounded-lg relative flex-col">
        <!-- div user/bouton -->
        <div class="flex justify-between">
            <!-- div bouton pour fermer -->
            <div @click="client.chat.showUserProfile = false"
                class="text-2xl py+6 hover:bg-white-500 cursor-pointer hover:text-white rounded m-1 text-black absolute right-0 top-0">
                <div class="i-mdi:close"></div>
            </div>
            <!-- div avatar user -->
            <div class="flex flex-col justify-center p-2 ">
                <img :src="client.chat.chatState.receiver.avatarPath" class="w-14 h-14 rounded-full" />
            </div>
            <!-- div bouton -->
            <div class=" p-2 ">
                <div v-if="client.chat.showAdd === 'none' && auth.session.username != client.chat.chatState.receiver.username" class=" p-2">
                    <button class="i-mdi:account-multiple-plus" @click="addFriend(client.chat.chatState.receiver.username)">Add a friend</button>
                </div>
                <div v-else-if="client.chat.showAdd === 'mutual' && auth.session.username != client.chat.chatState.receiver.username" class=" p-2">
                    <button class="i-material-symbols:chat-add-on" @click="chatWithUser(client.chat.chatState.receiver)">Start a chat</button>
                    <button class="i-material-symbols:person-remove-rounded" @click="removeFriend(client.chat.chatState.receiver.username)">Delete a friend</button>
                </div>
                <div v-else-if="client.chat.showAdd === 'justFriend' && auth.session.username != client.chat.chatState.receiver.username" class=" p-2">
                    <button class="i-material-symbols:person-remove-rounded" @click="removeFriend(client.chat.chatState.receiver.username)">Delete a friend</button>
                </div>
            </div>
        </div>

        <div>
            <button @click="sendGameInvite(client.chat.chatState.receiver.username)"
                :class="{'rounded bg-zinc-600 px-2 py-1 text-zinc-200 text-xs hover:bg-zinc-500':client.chat.chatState.receiver.status === 'ONLINE',
                         'rounded bg-zinc-600 px-2 py-1 text-zinc-400 text-xs':client.chat.chatState.receiver.status !== 'ONLINE'}">
                {{ client.chat.chatState.receiver.status === 'ONLINE' ? 'Challenge to a game of Pong' : 'Unavailable for challenge' }}
            </button>
        </div>
        <!-- div rectangle noir -->
        <div class="top-4 bg-zinc-800 px-3 py-4 rounded-lg relative flex-col">
            <!-- div pseudo -->
            <div class="flex flex-col justify-center ">
                <p class=" text-lg text-zinc-200" >{{ client.chat.chatState.receiver.username }}</p>
                <!-- <p class=" text-xs text-zinc-400" >ELO : {{ client.chat.chatState.receiver.ladderPoint}}</p> -->
            </div>
            <!-- div boutons -->
            <div class="flex border-b border-zinc-600">
                <button class="border-b border-zinc-800 hover:border-zinc-200 text-zinc-200 mt-2 mr-5 py-3">
                        <p class=" text-sm text-zinc-200" >Informations</p>
                </button>
                <button class="border-b border-zinc-800 hover:border-zinc-200  text-zinc-200 mt-2 mr-5 py-3">
                        <p class=" text-sm text-zinc-200" >Common channels</p>
                </button>
                <button class=" border-b border-zinc-800 hover:border-zinc-200 text-zinc-200 mt-2 mr-5 py-3">
                        <p class=" text-sm text-zinc-200" >Game history</p>
                </button>
            </div>
            <!-- div info selon bouton -->
            <div class="flex flex-col justify-center">
                <p class=" text-sm text-zinc-200 py-6" >Info selon bouton</p>
            </div>
        </div>
    </div>
</template>