<script setup lang="ts">
	const auth = useAuth()
	const chat = useChat()

    const messagesContainer = ref(null)

	watch(() => chat.conversation.channel.messages.length, async () => {
		await nextTick()
		messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
	})
    onMounted(() => {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })

</script>
<template>
	<div class="flex-1 overflow-y-scroll" ref="messagesContainer">
		<div class="flex flex-col gap-2  pb-3 pr-3" >
			<div v-for="message,i in chat.conversation.channel.messages" class="rounded-lg shadow-md p-2.5 w-80% flex" :class="[
				message.from == auth.session.id ? 'bg-green/50 ml-auto shadow-green' : 'bg-blue/50 shadow-blue',
			message.from != chat.conversation.channel.messages[i - 1]?.from ? 'mt-5' : ''
		]">
			<div class="flex gap-2">
				<div class="">
					<div class="rounded-full bg-gray p-2">
						<div class="i-mdi:user text-lg text-white"></div>
					</div>
				</div>
				<div class="flex flex-col">
					<div class="flex gap-2 items-center leading-1">
						<div>@{{ chat.getUserFromId(chat.conversation, message.from).user.username }}</div>
						<div class="text-xs text-gray-300">{{ message.timestamp.toLocaleString() }}</div>
					</div>
					<div class="text-sm mt-1.5 text-white/80 prose"><pre class="m-0 p-0 leading-tight">{{ message.content }}</pre></div>
				</div>
			</div>
		</div>
	</div>
	</div>
</template>