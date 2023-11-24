<script setup lang="ts">
	import slugify from 'slugify';
	const { notify }  = useNotification()

	const auth = useAuth()
	const chat = useChat()



	const search = ref('')
	let timer
	watch(() => chat.activeConversation.channel.name, async (v) => {
		await nextTick()
		clearTimeout(timer)
        let newName = slugify(v, {strict: true, lower: true})
			.trim()
			.slice(0, 20)
		timer = setTimeout(() => {
			chat.activeConversation.channel.name = newName
		}, 400)
	})
</script>
<template>
	<div class="flex-1 overflow-y-scroll" v-if="chat.activeConversation">
		<div class="flex flex-col gap-2  pb-3 px-3" >
			<div class="p-2.5 flex flex-col gap-5 items-center justify-center w-full">
            <div class="font-bold text-4xl">Update channel</div>
            <div class="w-60%">
                <input
                    v-model="chat.activeConversation.channel.name"
                    type="text"
                    maxlength="20"
                    placeholder="Update your channel name"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
                    />
            </div>
            <div class="w-60%">
                <textarea
                    v-model="chat.activeConversation.channel.description"
                    type="text"
                    rows="4"
                    maxlength="160"
                    placeholder="Enter a channel description"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
                    />
            </div>
            <div class="w-full flex flex-col gap-2 items-center">
                <div class="text-center font-bold">Channel Type</div>

                <ChatChannelTypeTabs :channel="chat.activeConversation.channel"/>

                <div class="w-60% mt-2" v-if="chat.activeConversation.channel.type == 'PROTECTED'">
                    <input
                    v-model="chat.activeConversation.channel.password"
                    type="text"
                    placeholder="Enter channel password"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
                    />
                </div>
            </div>
            <div class="w-60% mt-5">
                <button @click="chat.activeConversation.saveSettings" class="bg-zinc-500 px-3 py-2 rounded-lg w-full hover:bg-zinc-400">Update channel</button>
            </div>
        </div>
		</div>
	</div>
</template>