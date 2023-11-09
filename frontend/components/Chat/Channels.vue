<script setup lang="ts">
	const chat = useChat()
</script>
<template>
    <div class="h-50% text-white flex flex-col ">
        <div class="font-bold capitalize flex justify-between items-center p-2.5">
            <div>Channels</div>
            <div @click="chat.current = 'new_channel'" class="bg-gray p-1 rounded cursor-pointer hover:scale-110">
                <div class="i-mdi:plus"></div>
            </div>
        </div>
        <div class="overflow-y-scroll flex-1">
            <div v-for="channel in chat.channels" @click="chat.setConversation(channel)" class="px-2.5 py-1 hover:bg-white/10 cursor-pointer flex justify-center flex-col">
				<div>#{{ channel.channel.name }}</div>
				<div class="flex items-center justify-between flex-wrap break-all">
					<div class="text-xs text-gray">{{ chat.getChannelUsers(channel).length }} membre{{ chat.getChannelUsers(channel).length > 1 ? 's' : '' }}, {{ chat.getChannelOnlineUsers(channel).length }} en ligne</div>
                	<div class="bg-red rounded-full text-xs px-2 font-bold py-.5">123</div>
				</div>
            </div>
        </div>
    </div>
</template>