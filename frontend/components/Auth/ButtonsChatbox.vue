<script setup lang="ts">
const auth = useAuth()
const socket = useSocket()

const startConvUserB = () => {
    const payload = {
        sender : auth.session.username,
        receiver: 'userB',
        text: 'Test : message to userB !'
    }
    socket.emit('chatBox', payload);
};

const startConvUserA = () => {
    const payload = {
        sender : auth.session.username,
        receiver: 'userA',
        text: 'Test : message to userA !'
    }
    socket.emit('chatBox', payload);
};

//const receiver = ref('');
const index = 15;


</script>


<template>

<!-- <li v-for="(item, index) in items"></li> -->
    <div v-for="number in index" :key="number" class="mb-2">
        <div class="">
            <button  class=" mb-1 mt-2 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="startConvUserB">start conv B</button>
        </div>
    </div>

</template>