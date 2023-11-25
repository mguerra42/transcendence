import slugify from "slugify";
import { Socket } from "socket.io-client";

interface Message {
  id: number;
  content: string;
  from: number;
  timestamp: Date;
}

interface User {
  id: number;
  username: string;
  avatar: string;
  stats: {
    elo: number;
    victories: number;
    defeats: number;
  };
  isOnline: boolean;
}

interface Channel {
  id: number;
  name: string;
  description: string;
  messages: Message[];
  users: User[];
  content: string;
}

interface PrivateChannel {
  id: number;
  messages: Message[];
  users: User[];
  content: string;
}

export class WrappedConversation {
  socket: any;
  chat: any;
  messages: Message[]
  constructor(public  conversation: Conversation) {
    this.socket = useSocket();
    this.chat = useChat();
    this.messages = []
    this.init();
  }

  update(conversation: Conversation) {
    console.log("update", conversation);
    this.conversation = conversation;
    this.syncMessages();
  }

  leave(cb?: Function) {
    console.log("leave", this.channelId);
    this.socket.emit(
      "conversations:leave",
      { channelId: this.channelId },
      (answer) => {
        console.log("leave", { answer });
        if (typeof cb === "function") {
          cb(answer);
        }
        console.log("done leave");
      }
    );
  }

  async init() {
    // get messages
    this.syncMessages()
    // get users
  }

  sync() {
    this.socket.emit("conversations:sync", { channelId: this.channelId });
  }

  syncMessages() {
    this.socket.emit(
      `conversations:messages`,
      { channelId: this.channelId },
      (answer) => {
        this.messages = answer.messages;
      }
    );
  }
  saveSettings() {
    console.log("saveSettings", this.channelId);
    this.socket.emit(
      `conversations:update`,
      {
        channelId: this.channelId,
        name: this.channel.name,
        description: this.channel.description,
        type: this.channel.type,
        password:
          this.channel.type == "PROTECTED" ? this.channel.password : undefined,
      },
      (answer) => {
        console.log("settings", answer);
      }
    );
  }

  onNewMessage(message: Message) {
    console.log("onNewMessage", message);
    console.log("onNewMessage", this.messages);
    this.messages.push(message);
  }

  async syncStatus() {
    this.conversation.channel.users = this.conversation.channel.users.map((u) => {
        let status = this.chat.status[u.userId];
        if (status) {
            u.online = status == 'online';
        }
        return u;
    })
    }

  getUser(userId: number) {
    return this.users.find((u) => u.userId == userId)?.user;
  }

  searchUser(search: string) {
    return this.users.filter((u) =>
      u.user.username.toLowerCase().includes(search.toLowerCase())
    );
  }

  write() {
    console.log("write", this.channelId, this.message);

    this.socket.emit(
      `conversations:message`,
      { channelId: this.channelId, message: this.message },
      (answer) => {
        console.log("message", answer);
        //this.conversation.channel.messages.push(message)
      }
    );
    this.message = "";
  }

  get channelId() {
    return this.conversation.channelId;
  }

  get isChannel() {
    return this.conversation.channel.type != "DM";
  }

  get isDM() {
    return this.conversation.channel.type == "DM";
  }

  get isPublic() {
    return this.conversation.channel.type == "PUBLIC";
  }

  get isPrivate() {
    return this.conversation.channel.type == "PRIVATE";
  }

  get isProtected() {
    return this.conversation.channel.type == "PROTECTED";
  }

  get channel() {
    return this.conversation.channel;
  }

  get role() {
    return this.conversation.role;
  }

  get readUntil() {
    return this.conversation.readUntil;
  }

  get mutedUntil() {
    return this.conversation.mutedUntil;
  }

  get bannedUntil() {
    return this.conversation.bannedUntil;
  }

  get users() {
    return this.conversation.channel.users;
  }

  get online() {
    return this.conversation.channel.users.filter((u) => u.online);
  }

  get user() {
    return this.conversation.user;
  }

  get message() {
    return this.conversation.message;
  }

  set message(value) {
    this.conversation.message = value;
  }

  get recipient() {
    if (this.isDM) {
      return this.users.find((u) => u.userId != this.user.id);
    }
  }

  get isOwner() {
    return this.role === "OWNER";
  }

  get isAdmin() {
    return this.role === "ADMIN" || this.isOwner;
  }

  isRole(userId:number, role: string) {
    let user = this.users.find((u) => u.userId == userId);
    return user && user.role == role;
  }

  get isMuted() {
    return this.mutedUntil !== null;
  }

  get isBanned() {
    return this.bannedUntil !== null;
  }
}

class ConversationManager {
    conversations: Map<Number, WrappedConversation> = new Map();
    socket: any;
    isSetup: boolean;
    active?: WrappedConversation;
    chat : any;
    constructor() {
        this.socket = useSocket();
        this.chat = useChat();
        this.isSetup = false;
        this.active = undefined;
    }

    init() {
        this.socket.emit("conversations:list");
        this.socket.on("conversations:list", (answer) => this.onConversationsList(answer));
        this.socket.on("conversations:sync", (answer) => this.onConversationSync(answer));
        this.socket.on("conversations:leave", (answer) => this.onConversationLeave(answer));
        this.socket.on("conversations:left", (answer) => this.onConversationLeft(answer));
        this.socket.on("conversations:join", (answer) => this.onConversationJoin(answer));
        this.socket.on("conversations:joined", (answer) => this.onConversationJoined(answer));
        this.socket.on("conversations:message", (answer) => this.onConversationMessage(answer));
        this.socket.emit("conversations:friends", {}, (answer) => {
            console.log("friends", answer);
        });
    }

    onConversationsList({ conversations }: { conversations: Conversation[] }) {
        let ids = conversations.map((c) => c.channelId);
        conversations.forEach((c) => this.initOrUpdateConversation(c));
        this.conversations.forEach((c, id) => {
            if (!ids.includes(id)) {
                if (this.active == c) {
                    this.setActive(undefined);
                }
                this.conversations.delete(id);
            }
        });
        this.isSetup = true;

        console.log("onConversationsList");
    }

    onConversationSync({conversation, show = false} : {conversation: Conversation, show: boolean}) {
        this.initOrUpdateConversation(conversation, show);
    }
    onConversationLeave({channelId} : {channelId: number}) {
        this.conversations.delete(channelId);
    }
    onConversationLeft({channelId, userId} : {channelId: number, userId: number}) {
        let conversation = this.getConversation(channelId);
        if (conversation) {
            conversation.conversation.channel.users = conversation.conversation.channel.users.filter((u) => u.userId != userId);
        }
    }
    async onConversationJoin({channelId} : {channelId: number}) {
        let conversation = this.getConversation(channelId);
        while (!conversation) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            await nextTick();
            conversation = this.getConversation(channelId);
        }

        this.searchChannel(this.chat.searchChannelQuery)
        console.log("onConversationJoin", conversation);
 
    }

    onConversationJoined({channelId, userId} : {channelId: number, userId: number}) {
        let conversation = this.getConversation(channelId);
        console.log("onConversationJoined", conversation);
        if (conversation) {
            conversation.sync()
        }
    }

    onConversationMessage({channelId, ...message}) {
        let conversation = this.getConversation(channelId);
        if (conversation) {
            if (!this.chat.blockedUsers.includes(message.from)){
                conversation.onNewMessage(message);
            }
        }
    }

    searchChannel(query: string) {
        if (!query) return;
        this.socket.emit("conversations:search", { query }, (answer) => {
            console.log("search", answer);
            this.chat.searchChannelResults = answer;
        });
    }
    
    getConversation(channelId: number) {
        return this.conversations.get(channelId);
    }

    get channels() {
        return Array.from(this.conversations.values()).filter((c) => c.isChannel)
        .sort((a, b) => {
            // by id
            if (a.channelId < b.channelId) return 1;
            if (a.channelId > b.channelId) return -1;
            return 0;  
        });
    }

    get dms() {
        return Array.from(this.conversations.values()).filter((c) => c.isDM);
    }
    
    initOrUpdateConversation(conversation: Conversation, show = false) {
        let exists = this.getConversation(conversation.channelId);
        if (exists) {
            console.log("initOrUpdateConversation", conversation, exists);
            exists.update(conversation);
        } else {
            console.log("initOrUpdateConversation", conversation);
            this.conversations.set(conversation.channelId, new WrappedConversation(conversation));
        }

        if (show) {
            this.setActive(this.getConversation(conversation.channelId));
        }
    }

    setActive(conversation?: WrappedConversation) {
        this.active = conversation;
    }

    joinConversation({ channelId, password }) {
        this.socket.emit("conversations:join", {
            channelId,
            password,
        });
    }

    leaveConversation({ channelId, stay = false }) {
        console.log("leaveConversation", channelId);
        if (!channelId) return;
        this.socket.emit("conversations:leave", {
            channelId,
        }, () => {
            console.log("leaveConversation", channelId);
            this.searchChannel(this.chat.searchChannelQuery)
            this.setActive(undefined);
            if (stay) return;
            navigateTo({
                name: "chat",
            });
        });
    }

    createConversation(conversationInfo) {
        console.log("createConversation", conversationInfo);
        this.socket.emit("conversations:create", conversationInfo, async ({channelId}) => {
            console.log("createConversation", channelId);
            
        });
    }
    
}


export const useChat = defineStore("chat", () => {
  const socket = useSocket();
  const manager = ref(new ConversationManager());

  const visible = ref(false);
  const setVisible = (state: boolean) => (visible.value = state === true);

  const view = ref("home");
  const setView = (_view: string) => (view.value = _view);

  const onNotification = ({
    type,
    message,
  }: {
    type?: string;
    message: string;
  }) => {
    useNotification().notify({
      text: message,
      type: type,
    });
  };

  const conversations = ref<Map<Number, WrappedConversation>>(new Map());
  const activeConversation = ref<WrappedConversation>();
  const showConversation = (conversation: WrappedConversation) => {
    currentMode.value = 'chat'
    activeConversation.value = conversation;
    console.log("showConversation", conversation);
  };
  const hideConversation = () => {
    activeConversation.value = undefined;
    setView("home");
  };
  const isActiveConversation = (conversation: WrappedConversation) =>
    activeConversation.value === conversation;

  const joinConversation = ({ channelId, password }) => {
    socket.emit("conversations:join", {
      channelId,
      password,
    });
    setTimeout(() => {
        searchChannel()
    }, 100)
  };

  const onConversationsList = ({
    conversations: _conversations,
  }: {
    conversations: Conversation[];
  }) => {
    //console.log("conversations", _conversations);
    //_conversations.map((c) => createOrUpdateConversation({ conversation: c }));
    //const route = useRoute();
    //if (route.name == 'chat-conversation') {
    //    let conv = _conversations.find(c => c.channelId == route.params.conversation)
    //    if (conv) {
    //        showConversation(conversations.value.get(conv.channelId))
    //    }
    //}
  };

  const createOrUpdateConversation = ({
    conversation: _conversation,
    show = false,
  }: {
    conversation: Conversation;
    show?: boolean;
  }) => {
    let exists = conversations.value.get(_conversation.channelId);
    let wrapped = exists ? exists : new WrappedConversation(_conversation);

    if (!exists) conversations.value.set(_conversation.channelId, wrapped);
    else wrapped.update(_conversation);

    if (show) showConversation(wrapped);
  };
  const _onConversationsLeft = (channelId: number) => {
    console.log("left", channelId);
    let exists = conversations.value.get(channelId);
    if (exists) {
      if (exists && isActiveConversation(exists)) {
        hideConversation();
        setView("home");
      }
      conversations.value.delete(channelId);
    }
  };

  const _onConversationsMessage = ({
    channelId,
    id,
    from,
    content,
    timestamp,
  }: {
    id: number;
    channelId: number;
    from: number;
    content: string;
    timestamp: Date;
  }) => {
    let exists = conversations.value.get(channelId);
    if (exists) {
      exists.onNewMessage({
        id,
        from,
        content,
        timestamp,
      });
    }
  };
  const createConversation = async (conversationInfo) => {
    console.log("createConversation", conversationInfo);
    socket.emit("conversations:create", conversationInfo, async (conv) => {
        console.log("createConversation", conv);
        await navigateTo({
            name: "chat-conversation",
            params: {
                conversation: conv.channelId,
            },
        })
    });
  };

  const searchChannelQuery = ref('');
  const searchChannelResults = ref([]);
  const searchChannel = async () => {
    socket.emit("conversations:search", { query: searchChannelQuery.value }, (answer) => {
      console.log("search", answer);
      searchChannelResults.value = answer;
    });
  };
  const searchFriendResults = ref([]);
  const searchFriend = async (query: string) => {
    socket.emit("conversations:search-friend", { query }, (answer) => {
      console.log("search", answer);
      searchFriendResults.value = answer;
    });
  };

  const triggerSyncing = ({ channelId }) => {
    let exists = conversations.value.get(channelId);
    if (exists) {
      exists.sync();
    }
  };

  const addFriend = async (userId) => {
    socket.emit("conversations:friend-request", {userId});
  };
  const acceptFriend = async (userId) => {
    socket.emit("conversations:friend-accept", {userId});
  };
  const declineFriend = async (userId) => {
    socket.emit("conversations:friend-decline", {userId});
  };
  const challenge = async (userId) => {
    console.log("challenge", userId);
  };
  const kick = async (userId, channelId) => {
    console.log("kick", { userId, channelId });
  };
  const mute = async (userId, channelId) => {
    console.log("mute", { userId, channelId });
  };
  const ban = async (userId, channelId) => {
    console.log("mute", { userId, channelId });
  };
  const setAdmin = async (userId, channelId, state) => {
    console.log("setAdmin", { userId, channelId, state });
  };

  const status = ref({});
  const blockedUsers = ref([]);
  const friends = ref([]);

  const hasFriend = (userId) => {
    console.log("hasFriend", {userId}, friends.value);
    return friends.value.find((f) => f.id == userId);
  }

  const blockUser = async (userId, status) => {
    console.log("blockUser", {userId});
    socket.emit("conversations:block", {userId, status}, (answer) => {
      console.log("block", answer);
    //  blockedUsers.value = answer;
        socket.emit("conversations:blocked");
    });
  }

  const init = async () => {
    const { notify } = useNotification();
    const route = useRouter();
    socket.on("notification", onNotification);

    socket.on("status", async (data) => {
        status.value = data
        await nextTick()
        setTimeout(() => {
            conversations.value.forEach((c) => {
                c.syncStatus()
            })
        }, 100)
    });

    socket.on("conversations:friends", (_friendsUsers) => {
        console.log("FRiends updated", _friendsUsers)
        friends.value = _friendsUsers;
    });
    socket.on("conversations:friend-request", ({}) => {
        notify({
            text: "You have a new friend request",
            type: "info",
        });
        socket.emit("conversations:friends")
        socket.emit("conversations:list")
    });
    socket.on("conversations:friend-accept", ({}) => {
        console.log("conversations:friend-accept")
        socket.emit("conversations:friends")
        socket.emit("conversations:list")
    });
    socket.on("conversations:friend-decline", ({}) => {
        console.log("conversations:friend-decline")
        socket.emit("conversations:friends")
        socket.emit("conversations:list")
    });
    socket.on("conversations:blocked", (_blockedUsers) => {
        blockedUsers.value = _blockedUsers;
    });
    socket.emit("conversations:blocked");
    await manager.value.init();

    //socket.emit("conversations:list");
    //socket.on("conversations:list", onConversationsList);
    //socket.on("conversations:sync", createOrUpdateConversation);


    //socket.on("conversations:syncing", triggerSyncing);
    //socket.on("conversations:join", (d) => {
    //    console.log("conversations:join", d);
        
    //});
    //socket.on("conversations:left", (d) => {
        
    //    console.log("conversations:left", d);
    //});
    //socket.on("conversations:left", _onConversationsLeft);
    //socket.on("conversations:message", _onConversationsMessage);
    //
    //socket.on('channels:list', (data) => {
    //    data.forEach(c => {
    //        console.log("onJoinChannels", onJoinChannels.value, c)
    //        onJoinChannels.value = onJoinChannels.value.filter((x) => {
    //            if (c.channelId == x.channelId) {
    //                x.cb ? x.cb(c) : null
    //                return false
    //            }
    //            return true
    //        })
    //    })
    //	channels.value = data
    //    if (conversation.value.channelId) {
    //        let conv = data.find(c => c.channelId == conversation.value.channelId)
    //        if (conv) {
    //            setConversation(conv)
    //        }
    //    }
    //    if (next.value) {
    //        let conv = data.find(c => c.channel.name == next.value)
    //        if (conv) {
    //            setConversation(conv)
    //        }
    //        next.value = ''
    //    }
    //	console.log("channels list", data)
    //})
    //socket.on('channels:status', (data) => {
    //    console.log("channels error", data)
    //    notify({
    //        text: data.message,
    //        type: data.success ? 'success' : 'error',
    //    });
    //})
    //socket.on('channels:search', (data) => {
    //    searchChannelLoading.value = false
    //    searchChannelResults.value = data
    //})
    //socket.on('channels:message', (data) => {
    //	//channels.value = data
    //	console.log("channels message", data)
    //	let conversation = getChannel(data.channelId)
    //	if (conversation) {
    //		conversation.channel.messages.push({
    //			from: data.from,
    //			content: data.content,
    //			timestamp: data.timestamp
    //		})
    //	}
    //})
    //socket.emit('channels:list', {})
  };

  //const channels = ref<Channel[]>([])
  //const dms = ref<PrivateChannel[]>([])

  //const current = ref('home')

  //const newChannel = ref({
  //    name: '',
  //    description: '',
  //    type: 'PUBLIC',
  //    password: '',
  //})

  //const next = ref('')
  //const updateChannel = async () => {
  //    console.log('Send msg to socket')
  //    socket.emit('channels:update', {
  //        channelId: conversation.value.channelId,
  //        channel: conversation.value.channel
  //    })
  //}

  //const conversation = ref({
  //	channelId: '',
  //	role: 'USER',
  //	mutedUntil: null,
  //	bannedUntil: null,
  //	content: '',
  //	channel: {
  //		id: null,
  //		name: '',
  //		password: '',
  //		type: 'PUBLIC',
  //		description: '',
  //		users: [],
  //		messages: []
  //	}
  //})

  //const setConversation = async (channel: any) => {
  //    if (channel.channelId) {
  //        current.value = 'channel'
  //        conversation.value = channel
  //    } else {
  //        conversation.value = {
  //            channelId: '',
  //            role: 'USER',
  //            mutedUntil: null,
  //            bannedUntil: null,
  //            content: '',
  //            channel: {
  //                id: null,
  //                name: '',
  //                password: '',
  //                type: 'PUBLIC',
  //                description: '',
  //                users: [],
  //                messages: []
  //            }
  //        }
  //    }
  //}

  //const getChannel = (channelId) => channels.value.find(conv => conv.channelId == channelId)

  //const sendMessage = async () => {
  //	socket.emit('channels:message', {
  //		channelId: conversation.value.channelId,
  //		content: conversation.value.content
  //	})
  //	conversation.value.content = ''
  //}

  //const leaveChannel = async (channelId) => {
  //    socket.emit('channels:leave', {
  //        channelId
  //    })
  //    setConversation({})
  //    current.value = 'home'
  //}

  //const onJoinChannels = ref([])

  const showProfile = (user: ChatProfile) => {
    console.log({
      user,
    });
    currentProfile.value = user;
    //setView('profile')
  };

  const currentProfile = ref<ChatProfile|null>();
  const compactMode = ref(false)
  const currentMode = ref('channels')
  //const searchTextChannel = ref('')
  //const searchChannelLoading = ref(false)
  //const searchChannelResults = ref([])
  //const searchChannel = (name: string) => {
  //    searchChannelLoading.value = true
  //    socket.emit('channels:search', {name})
  //}
  //const joinChannel = async (channel) => {
  //    socket.emit('channels:join', {
  //        channelId: channel.id,
  //        password: channel.password,
  //    })
  //    next.value = channel.name
  //}

  //const onJoinChannel = (channelId, cb) => {
  //    onJoinChannels.value.push({
  //        channelId,
  //        cb,
  //    })
  //}

  //const getChannelUsers = (channel: Channel) => channel.users
  //const getChannelOnlineUsers = (conv) => conv.channel.users.filter(u => u.online)
  //const getUserFromId = (conv, id: number) => conv.channel.users.find(u => u.user.id == id)

  return {
    init,
    visible,
    setVisible,

    view,
    setView,

    conversations,
    showConversation,
    searchChannel,
    searchChannelQuery,
    searchChannelResults,
    hideConversation,
    activeConversation,
    isActiveConversation,
    joinConversation,

    createConversation,
    currentProfile,
    showProfile,

    searchFriendResults,
    searchFriend,
    addFriend,
    acceptFriend,
    declineFriend,
    challenge,
    blockUser,
    blockedUsers,
    status,
    friends,
    hasFriend,

    kick,
    mute,
    ban,
    setAdmin,
    compactMode,
    currentMode,

    manager,

    //current,
    //currentProfile,
    //compactMode,
    //currentMode,
    //searchTextChannel,
    //searchChannel,
    //searchChannelLoading,
    //searchChannelResults,
    //newChannel,
    //updateChannel,
    //createChannel,
    //leaveChannel,
    //joinChannel,
    //onJoinChannel,
    //channels,
    //getChannelUsers,
    //getChannelOnlineUsers,
    //getUserFromId,
    //conversation,
    //setConversation,
    //sendMessage,
    //dms,
  };
});



export type WrappedConversationType = typeof WrappedConversation