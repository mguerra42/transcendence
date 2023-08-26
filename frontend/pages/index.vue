<script setup lang="ts">
const online = useOnline()

const message = await $fetch('http://backend:3000/hello')
</script>

<template>
    <div class="h-full flex justify-center items-center flex-col">
        <div>
            {{ message }}
            <Counter/>
        </div>
    </div>
</template>
