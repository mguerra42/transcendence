<script setup lang="ts">
const {data} = await useFetch('http://backend:3000/hello')
</script>

<template>
<div class="flex items-center h-full justify-center flex-col">
    <div>Contessssnt</div>
    <div>Message from backend: {{ data }}</div>
</div>
</template>
