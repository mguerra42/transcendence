<script setup lang="ts">
    const client = useClient();
    const channel = useChannel();
    const friend = useFriend();
    const auth = useAuth();
    const socket = useSocket();
    const channelName = ref('');
    const channelAccess = ref('');

    const addNewChannel = async () =>
    {
        if (channelName.value == '' && channelAccess.value == '')
        {
            alert('Invalid form');
            client.chat.showChannelProfile = false;
            return ;
        }
        if (channelName.value == '')
        {
            client.chat.showChannelProfile = false;
            alert('Channel name is empty');
            return ;
        }
        if (channelAccess.value == '')
        {
            client.chat.showChannelProfile = false;
            alert('Channel access is empty');
            return ;
        }

        await channel.createChannel(channelName.value, channelAccess.value);
        client.chat.showChannelProfile = false;
    }

    onMounted (async () => {
  });
</script>

<template>
    <!-- div principale -->
    <div class="w-100 bg-zinc-700 px-2 py-6 rounded-lg relative flex-col">
        <!-- div user/bouton -->
        <div class="flex justify-between">
            <!-- div bouton pour fermer -->
            <div @click="client.chat.showChannelProfile = false"
                class="text-2xl py hover:bg-white-500 cursor-pointer hover:text-white rounded m-1 text-black absolute right-0 top-0">
                <div class="i-mdi:close"></div>
            </div>
            <!-- div avatar user -->
            <div class="flex flex-col justify-center ">
                <input type="ChannelName" v-model="channelName" name="channelName" placeholder="Channel name" class="rounded-lg px-3 py-2 text-black b-1 " />
            </div>
        </div>

        <!-- div rectangle noir -->
        <div class="top-4 bg-zinc-800 px-3 py-4 rounded-lg relative flex-col text-white">
            <!-- div pseudo -->
            Access : 
            <select
                type="form-select"
                v-model="channelAccess"
                text-black>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
                <option value="PROTECTED">Protected by a password</option>
            </select>
            <button type="submit" @click="addNewChannel" class="bg-zinc-100 text-zinc rounded-lg ml-4 cursor-pointer hover:scale-105 transition duration-100">
                    Submit
            </button>
        </div>
    </div>
</template>