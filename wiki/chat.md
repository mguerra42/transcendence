ChatModule: Contient l'ensemble des composants du chat
| > ChatOpen : Bouton pour ouvrir le chat
| > ChatContainer: Contient ChatConversations (channels + dm) et ChatContent
| > ChatConversations: Contient ChatChannelList et ChatDmList
| > ChatContent: Composant versatile qui affiche le contenu du chat, ou les formulaires pour créer un channel ou encore la liste des utilisateurs connectés


Chat Client methods

chat.setVisible(bool)
// Show/hide chat

chat.sanitizeChannel({name, description, type, password})
// Sanitize channel info, return sanitized channel info

chat.createChannel({name, description, type, password})
// Create a new channel
// Name should be unique
// if type is PUBLIC, anyone can join
// if type is PRIVATE, nobody can join the channel unless they are invited by admin/owner
// if type is PROTECTED, password is required to join, can be bypassed by admin/owner

chat.updateChannel({channelId, name, description, type, password})
// Update channel info, same rules as createChannel

chat.joinChannel({channelId, password?})
// Join a channel, optional password if channel type is PROTECTED

chat.leaveChannel({channelId})
// Leave a channel
// If you are the owner, ownership is transferred to first admin in the list
// If no admin, ownership is transferred to first member in the list
// If no member left, channel is deleted

chat.inviteUser({channelId, userId})
// Invite a user to a channel
// Only admin/owner can invite users, bypassing the channel type

chat.kickUser({channelId, userId})
// Kick a user from a channel
// Only admin/owner can kick users

chat.muteUser({channelId, userId, until? = 60})
// Mute user on a channel
// Only admin/owner can mute users
// If until is specified, user is muted for the specified amount of time in seconds

chat.unmuteUser({channelId, userId})
// Unmute user on a channel
// Only admin/owner can unmute users
// If user is not muted, nothing happens

chat.banUser({channelId, userId, until? = 60})
// Ban user from a channel
// Only admin/owner can ban users
// If until is specified, user is banned for the specified amount of time in seconds
// If until is not specified, user is banned until year 4242.
// If user is already banned, nothing happens

chat.unbanUser({channelId, userId})
// Unban user from a channel
// Only admin/owner can unban users
// If user is not banned, nothing happens


chat.searchChannel({query})
// Search for a channel
// Returns a list of channels matching the query in name or description

chat.syncConversations()
// Sync channels data with server, on first load or on demand, as state is updated with others events

chat.sendFriendRequest({userId})

chat.acceptFriendRequest({userId})

chat.declineFriendRequest({userId})

chat.removeFriend({userId})

chat.blockUser({userId})

chat.unblockUser({userId})

chat.sendMessage({channelId, message})

chat.searchMember({channelId, query})

chat.addAdmin({channelId, userId})

chat.removeAdmin({channelId, userId})

chat.searchUser({query})

chat.showProfile({user})

chat.sendChallenge({userId})

chat.acceptChallenge({userId})

chat.declineChallenge({userId})



EVENTS

> Means that the event is sent by the client/received by the server
< Means that the event is received by the client/sent by the server

> conversations:list ask for the list of conversations (channels + dm)
< conversations:list return Conversation[]

We then use the Manager class to create WrappedConversation objects from the Conversation objects, this is a simple wrapper class that exposes methods to interact with the conversation like leave or send message, and also contains the Conversation object.

