<script setup lang="ts">

</script>

<template>
  <div class="flex flex-col h-full">
    <header class="h-61px bg-red">Navbar</header>
    <div class="flex h-full">
        <aside class="w-240px bg-blue h-full">Sidebar left</aside>
        <section class="flex-1 w-full">
            <slot/>
        </section>
        <aside class="w-240px bg-green h-full">Sidebar right</aside>
    </div>
  </div>
</template>
