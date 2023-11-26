<script setup lang="ts">
    const route = useRoute()
</script>
<template>
    <div>
        Profile of {{ route.params.user }}
    </div>
</template>