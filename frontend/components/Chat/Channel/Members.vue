<script setup lang="ts">
	const auth = useAuth()
	const chat = useChat()

	const search = ref('')
	const members = computed(() => {
		if(search.value && chat.activeConversation) return chat.activeConversation.searchUser(search.value)
		return chat.activeConversation?.users
	})
</script>
<template>
	<div class="flex-1 overflow-y-scroll">
		<div class="flex flex-col gap-2  pb-3 px-3" >
			<div>

                <input
                    v-model="search"
                    type="text"
                    placeholder="Search member..."
                    class="w-full px-4 py-2 text-sm rounded-lg b-1 bg-zinc-600 focus:outline-none focus:text-zinc-300"
                    />
			</div>
			<div class="grid sm:grid-cols-2 gap-2">
				<ChatProfileCard :user="user" v-for="user in members" />
			</div>
		</div>
	</div>
</template>