<template>
  <main class="h-full">
    <Header/>
    <div class="h-[calc(100vh-80px)] b-1 flex">
        <div class="b-r">Sidebar Left</div>
        <div class="flex-1"><slot /></div>
        <div class="b-l">Sidebar Right</div>
    </div>
    <Footer/>
  </main>
</template>