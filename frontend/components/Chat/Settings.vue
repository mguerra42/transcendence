<script setup lang="ts">
	import slugify from 'slugify';
	
	const auth = useAuth()
	const chat = useChat()

	const search = ref('')
	const members = computed(() => {
		if(search.value) return chat.conversation.channel.users.filter(u => {
			return u.user.username.toLowerCase().includes(search.value)
		})
		return chat.conversation.channel.users
	})
	let timer
	watch(() => chat.conversation.channel.name, async (v) => {
		await nextTick()
		await nextTick()
		clearTimeout(timer)
		timer = setTimeout(() => {
			chat.conversation.channel.name = slugify(v, {strict: true, lower: true})
			.trim()
			.slice(0, 20)
		}, 400)
	})
</script>
<template>
	<div class="flex-1 overflow-y-scroll">
		<div class="flex flex-col gap-2  pb-3 px-3" >
			<div class="p-2.5 flex flex-col gap-5 items-center justify-center w-full">
            <div class="font-bold text-4xl">Update channel</div>
            <div class="w-60%">
                <input
                    v-model="chat.conversation.channel.name"
                    type="text"
                    placeholder="Update your channel name"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
                    />
            </div>
            <div class="w-60%">
                <textarea
                    v-model="chat.conversation.channel.description"
                    type="text"
                    rows="4"
                    placeholder="Enter a channel description"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
                    />
            </div>
            <div class="w-full flex flex-col gap-2 items-center">
                <div class="text-center font-bold">Channel Type</div>
                <div class="flex w-full mx-auto max-w-80% ">
                    <label :class="[chat.conversation.channel.type == 'PUBLIC' ? 'bg-white text-gray-800' : '']" for="public_channel" class="flex-1 text-center hover:bg-white cursor-pointer hover:text-gray-800 b-1 rounded-l overflow-hidden">
                        
                        <div class="px-3 py-1 flex gap-1 justify-center items-center ">
                            <div class="i-mdi:lock-open"></div>
                            <div>Public</div>
                        </div>
                        <input class="hidden" v-model="chat.conversation.channel.type" type="radio" id="public_channel" name="channel-type" value="PUBLIC"/>
                    </label>
                    <label :class="[chat.conversation.channel.type == 'PRIVATE' ? 'bg-white text-gray-800' : '']" for="private_channel" class="flex-1 text-center hover:bg-white cursor-pointer hover:text-gray-800 b-y overflow-hidden">
                        <div class=" px-3 py-1 flex gap-1 justify-center items-center">
                            <div class="i-mdi:lock"></div>
                            <div>Private</div>
                        </div>
                        <input class="hidden" v-model="chat.conversation.channel.type" type="radio" id="private_channel" name="channel-type" value="PRIVATE"/>
                    </label>
                    <label :class="[chat.conversation.channel.type == 'PROTECTED' ? 'bg-white text-gray-800' : '']" for="protected_channel" class="flex-1 text-center hover:bg-white cursor-pointer hover:text-gray-800 rounded-r  overflow-hidden b-1 ">
                        <div class="px-3 py-1 flex gap-1 justify-center items-center ">
                            <div class="i-mdi:key"></div>
                            <div>Protected</div>
                        </div>
                        <input class="hidden" v-model="chat.conversation.channel.type" type="radio" id="protected_channel" name="channel-type" value="PROTECTED"/>
                    </label>
                </div>
                <div class="w-60% mt-2" v-if="chat.conversation.channel.type == 'protected'">
                    <input
                    v-model="chat.conversation.channel.password"
                    type="text"
                    placeholder="Enter channel password"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
                    />
                </div>
            </div>
            <div class="w-60% mt-5">
                <button @click="chat.updateChannel" class="bg-zinc-500 px-3 py-2 rounded-lg w-full hover:bg-zinc-400">Update channel</button>
            </div>
        </div>
		</div>
	</div>
</template>