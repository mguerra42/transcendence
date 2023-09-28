<script setup lang="ts">
const client = useClient();
//const auth = useAuth();
</script>

<template>
    <!-- div principale -->
    <div class="w-100 bg-zinc-700 p-6 rounded-lg relative flex-col">
        <!-- div user/bouton -->
        <div class="flex justify-between">
            <!-- div bouton pour fermer -->
            <div @click="client.chat.showUserProfile = false"
                class="text-2xl py+6 hover:bg-white-500 cursor-pointer hover:text-white rounded m-1 text-black absolute right-0 top-0">
                <div class="i-mdi:close"></div>
            </div>
            <!-- div avatar user -->
            <div class="flex flex-col justify-center p-2 ">
                <img :src="client.chat.chatState.receiver.avatarPath" class="w-12 h-12 rounded-full" />
            </div>
            <!-- div bouton -->
            <div class=" p-2 ">
                <button class="bg-zinc-600 hover:bg-zinc-500 rounded-lg text-zinc-200 text-sm px-2 py-2 mt-2">
                    <div class="flex flex-col">
                        <div class="i-mdi:account-multiple-plus"></div>
                    </div>
                    <div class="flex flex-col">
                        <p class=" text-md text-zinc-200" >Add friend</p>
                    </div>
                </button>
            </div>
        </div>

        <!-- div rectangle noir -->
        <div class="top-4 bg-zinc-800 p-6 rounded-lg relative flex-col">
            <!-- div pseudo -->
            <div class="flex flex-col justify-center">
                <p class=" text-md text-zinc-200" >{{ client.chat.chatState.receiver.username }}</p>
                <p class=" text-xs text-zinc-400" >ELO : {{ client.chat.chatState.receiver.ladderPoint}}</p>
            </div>
            <!-- div boutons -->
            <div class="flex justify-between">
                <button class=" hover:bg-zinc-500 rounded-lg text-zinc-200 text-sm px-2 py-2 mt-2">
                    <div class="flex flex-col">
                        <p class=" text-md text-zinc-200" >Bouton 1</p>
                    </div>
                </button>
                <button class="hover:bg-zinc-500 rounded-lg text-zinc-200 text-sm px-2 py-2 mt-2">
                    <div class="flex flex-col">
                        <p class=" text-md text-zinc-200" >Bouton 2</p>
                    </div>
                </button>
                <button class=" hover:bg-zinc-500 rounded-lg text-zinc-200 text-sm px-2 py-2 mt-2">
                    <div class="flex flex-col">
                        <p class=" text-md text-zinc-200" >Bouton 3</p>
                    </div>
                </button>
            </div>
            <!-- div info selon bouton -->
            <div class="flex flex-col justify-center">
                <p class=" text-md text-zinc-200 py-6" >Info selon bouton</p>
            </div>
        </div>
    </div>
</template>