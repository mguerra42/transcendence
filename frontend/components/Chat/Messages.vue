<script setup lang="ts">
	const auth = useAuth()
	const chat = useChat()

    const messagesContainer = ref(null)

	watch(() => chat.activeConversation?.messages.length, async () => {
		await nextTick()
        if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
	})
    onMounted(() => {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })

    const onRightClick = (e) => {
        e.preventDefault();
        
        console.log(e)
    }

</script>
<template>
	<div class="bg-zinc-600 overflow-y-scroll rounded h-full " ref="messagesContainer">
		<div class="flex flex-col gap-2  pb-3 pr-3" >
			<div v-for="message,i in chat.activeConversation?.messages" class="rounded-lg  p-2.5 w-80% flex" :class="[
				message.from === 0 ? '' : (message.from == auth.session?.id ? 'bg-green/50 ml-auto shadow-green' : 'bg-blue/50 shadow-blue'),
			message.from != chat.activeConversation?.messages[i - 1]?.from ? 'mt-5' : ''
		]">
			<div class="flex gap-2">
				<div  v-if="message.from !== 0" class="" @click.right="onRightClick">
					<div class="rounded-full bg-gray p-2">
						<div class="i-mdi:user text-lg text-white"></div>
					</div>
				</div>
				<div class="flex flex-col">
					<div class="flex gap-2 items-center leading-1">
                        <ChatProfileHandle v-if="message.from > 0" :userId="message.from" />
						<div class="text-xs text-gray-300">{{ message.timestamp.toLocaleString() }}</div>
					</div>
					<div class="text-sm mt-1.5 text-white/80 prose"><pre class="m-0 p-0 leading-tight">{{ message.content }}</pre>
                    </div>
				</div>
			</div>
		</div>
	</div>
	</div>
</template>