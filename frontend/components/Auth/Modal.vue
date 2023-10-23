<script setup lang="ts">
const auth = useAuth()
const socket = useSocket();
const client = useClient();



</script>

<template>

  <div v-if="auth.showForm" class="absolute top-0 bottom-0 left-0 right-0 z-10 flex justify-center items-center bg-black/60 backdrop-blur-sm" >
    <AuthLoginForm v-if="auth.mode === 'login'" />
    <AuthSignUpForm v-else />
    <!-- <AuthUserForm v-if="auth.mode === 'login'" /> -->
  </div>

  <div v-if="client.chat.showUserProfile" class="absolute top-0 bottom-0 left-0 right-0 z-10 flex justify-center items-center bg-black/82 backdrop-blur-sm" >
    <ChatUserProfile/>
  </div>
  
  <div v-if="auth.showUserForm" class="absolute top-0 bottom-0 left-0 right-0 z-10 flex justify-center items-center bg-black/60 backdrop-blur-sm" >
    <UserForm v-if="auth.logged === true" />
  </div>
  <!-- <div @click="console.log(auth.showQRCode )">test v if auth.showQRCode  </div> -->
  <div v-if="auth.showQRCode === true" class="backdrop-blur-sm bg-pink/60" >
    <img :src="auth.QRCodeURL" alt="QR Code" />
 
     <div>TEST</div>
  </div>

  <div v-if="auth.logged === true" >
    <ChatContainer/>
  </div>

</template>
