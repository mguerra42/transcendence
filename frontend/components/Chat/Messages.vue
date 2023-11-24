<script setup lang="ts">
import { WrappedConversation } from '~/composables/chat';

const auth = useAuth();
const chat = useChat();

const messagesContainer = ref(null);

watch(
  () => chat.activeConversation?.messages.length,
  async () => {
    await nextTick();
    if (messagesContainer.value)
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
);
onMounted(() => {
  messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
});

const onRightClick = (e) => {
  e.preventDefault();

  console.log(e);
};
</script>
<template>
  <div
    class="bg-zinc-600 overflow-y-scroll rounded h-full"
    ref="messagesContainer"
  >
    <div class="flex flex-col gap-2 pb-3 pr-3">
      <div
        v-for="(message, i) in chat.activeConversation?.messages"
        class="rounded-lg p-2.5 w-80% flex"
        :class="[
          message.from === 0
            ? ''
            : message.from == auth.session?.id
            ? 'bg-green/50 ml-auto shadow-green'
            : 'bg-blue/50 shadow-blue',
          message.from != chat.activeConversation?.messages[i - 1]?.from
            ? 'mt-5'
            : '',
        ]"
      >
        <div class="flex gap-2">
          <div v-if="message.from !== 0" class="" @click.right="onRightClick">
            <ChatProfileModalTrigger
              class="hover:text-blue-200 cursor-pointer hover:scale-110 transition-all"
              v-if="message.from > 0"
              :userId="message.from"
            >
              <template v-slot="{ user }">
                <div class="rounded-full bg-gray p-2">
                  <div class="i-mdi:user text-lg text-white"></div></div
              ></template>
            </ChatProfileModalTrigger>
          </div>
          <div class="flex flex-col">
            <div class="flex gap-2 items-center leading-1">
              <ChatProfileModalTrigger
                class="hover:text-blue-200 cursor-pointer hover:scale-110 transition-all"
                v-if="message.from > 0"
                :userId="message.from"
              >
                <template v-slot="{ user }">@{{ user?.username }}</template>
              </ChatProfileModalTrigger>
              <div class="text-[12px] text-gray-300">
                {{ new Date(message.timestamp).toLocaleString() }}
              </div>
            </div>
            <div class="text-sm mt-3 text-white/80 prose">
              <pre class="m-0 p-0 leading-tight">{{ message.content }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
