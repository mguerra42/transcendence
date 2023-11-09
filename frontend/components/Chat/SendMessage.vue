<script setup lang="ts">
	const auth = useAuth()
	const chat = useChat()
</script>
<template>
    <div class=" flex items-center w-full bg-gray-800 p-1 rounded-lg gap-2">
			<textarea v-model="chat.conversation.content" @keypress.ctrl.enter="chat.sendMessage(cc)" class="h-80px flex-1 w-full bg-transparent text-lg outline-none pl-3 pt-1 resize-none"></textarea>
		<div>
			<div @click=chat.sendMessage(cc) class="bg-blue hover:scale-110 cursor-pointer rounded-full text-3xl p-2 mr-2">
				<div class="i-mdi:send"></div>
			</div>
		</div>
	</div>
</template>