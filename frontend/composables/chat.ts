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
  messages: Ref<Message[]>;
  constructor(public conversation: Conversation) {
    this.socket = useSocket();
    this.chat = useChat();
    this.messages = ref([]);
    this.syncMessages();
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

  sync() {
    this.socket.emit("conversations:sync", { channelId: this.channelId });
  }

  syncMessages() {
    console.log("syncMessages", this.channelId);
    this.socket.emit(
      `conversations:messages`,
      { channelId: this.channelId, readUntil: this.readUntil },
      (answer) => {
        console.log("messages", answer);
        this.messages.value = answer.messages;
        //this.conversation.channel.messages = answer.messages
        //this.conversation.channel  =  this.conversation.channel
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

  get isOwner() {
    return this.role === "OWNER";
  }

  get isAdmin() {
    return this.role === "ADMIN" || this.isOwner;
  }

  get isMuted() {
    return this.mutedUntil !== null;
  }

  get isBanned() {
    return this.bannedUntil !== null;
  }
}

export const useChat = defineStore("chat", () => {
  const socket = useSocket();

  const visible = ref(false);
  const setVisible = (state: boolean) => (visible.value = state === true);

  const view = ref("home");
  const setView = (_view: string) => (view.value = _view);

  const _onNotification = ({
    type,
    message,
  }: {
    type?: string;
    message: string;
  }) => {
    console.log("notification", type, message);
    useNotification().notify({
      text: message,
      type: type,
    });
  };

  const conversations = ref<Map<Number, WrappedConversation>>(new Map());
  const activeConversation = ref<WrappedConversation>();
  const showConversation = (conversation: WrappedConversation) => {
    activeConversation.value = conversation;
    setView("channel");
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
  };

  const _onConversationsList = ({
    conversations: _conversations,
  }: {
    conversations: Conversation[];
  }) => {
    console.log("conversations", _conversations);
    _conversations.map((c) => _onConversationsSync({ conversation: c }));
  };

  const _onConversationsSync = ({
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
    socket.emit("conversations:create", conversationInfo);
  };

  const searchChannelResults = ref([]);
  const searchChannel = async (query: string) => {
    socket.emit("conversations:search", { query }, (answer) => {
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
    console.log("addFriend", userId);
  };
  const challenge = async (userId) => {
    console.log("challenge", userId);
  };
  const blockUser = async (userId) => {
    console.log("blockUser", userId);
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

  const init = async () => {
    const { notify } = useNotification();

    socket.on("notification", _onNotification);
    socket.on("conversations:list", _onConversationsList);
    socket.on("conversations:sync", _onConversationsSync);
    socket.on("conversations:syncing", triggerSyncing);
    socket.on("conversations:left", _onConversationsLeft);
    socket.on("conversations:message", _onConversationsMessage);
    socket.emit("conversations:list");
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

  const showProfile = (user) => {
    console.log({
      user,
    });
    currentProfile.value = user;
    //setView('profile')
  };

  const currentProfile = ref({
    online: false,
    user: {
      id: 0,
    },
  });
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
    challenge,
    blockUser,

    kick,
    mute,
    ban,
    setAdmin,
    compactMode,
    currentMode,

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
