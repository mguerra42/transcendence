<script setup lang="ts">
    const route = useRoute()
    const auth = useAuth()
    const game = useGame()

    const state = ref({
        canvas: {
            w: 600,
            h: 600,
        },
        left: {
            x: 0,
            y: 0,
            w: 20,
            h: 80,
            score: 0,
            color: 'white'
        },
        right: {
            x: 0,
            y: 0,
            w: 20,
            h: 80,
            score: 0,
            color: 'white'
        },
        ball: {
            x: 0.5,
            y: 0.5,
            w: 20,
            h: 20,
            speed: 0,
            velX: 6,
            velY: 6,
            color: 'white'
        },
    })
    const handleKeydown = (e: KeyboardEvent) => {
        console.log('handleKeydown: ', e.key)
        if (e.key === 'ArrowDown') {
            state.value.left.y = Math.min(0.85, state.value.left.y + 0.1)
        }
        if (e.key === 'ArrowUp') {
            //state.value.left.y -= 0.1
            state.value.left.y = Math.max(0, state.value.left.y - 0.1)
        }
    }

let inv = ref()
    onMounted(async () => {
        await game.connect(route.params.game)
        document.addEventListener('keydown', handleKeydown)
        console.log('onMounted: Pong.vue')
        //inv.value = setInterval(() => {
        //    // ball.x is percentage of canvas width, so 
        //    let realX = state.value.ball.x * state.value.canvas.w
        //    if (realX + state.value.ball.w >= state.value.canvas.w) {
        //        state.value.ball.velX = -state.value.ball.velX
        //    }
        //    if (realX - state.value.ball.w  <= 0) {
        //        state.value.ball.velX = -state.value.ball.velX
        //    }
        //    let realY = state.value.ball.y * state.value.canvas.h
        //    if (realY + state.value.ball.h >= state.value.canvas.h) {
        //        state.value.ball.velY = -state.value.ball.velY
        //    }
        //    if (realY - state.value.ball.h <= 0) {
        //        state.value.ball.velY = -state.value.ball.velY
        //    }
        //    state.value.ball.x += state.value.ball.velX / state.value.canvas.w
        //    state.value.ball.y += state.value.ball.velY / state.value.canvas.h

        //}, 1000/60)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('keydown', handleKeydown)
        clearInterval(inv.value)
    })
</script>
<template>
    <div class="flex flex-col items-center  h-full">
        <div class="flex-1 w-full h-full max-w-5xl flex flex-col gap-5">
            
            <div class="">
                <div v-if="true" :class="{'bg-zinc-700 shadow-lg hover:bg-zinc-700 w-full h-80 cursor-pointer rounded-lg flex flex-col justify-center' : true ,}">

        <div class="my-10 mt-10 flex justify-center text-lg sm:text-[1.5rem] md:text-3xl lg:text-4xl  font-bold">
                Game #{{ route.params.game  }}
            </div>
        <div class="flex mt-1 justify-center">
            <div class="flex">
                <div class="flex justify-center">
                    <div class="flex-col flex justify-center">
                        <p class="text-lg text-center text-zinc-200" >{{ auth.session.username }}</p>
                        <p class="text-xs text-center text-zinc-400" >W/L : 10-3</p>
                        <p class="text-xs text-center text-zinc-400" >Elo : 1230</p>
                    </div>
                </div>
                <img :src="auth.session.avatar" class="w-30 h-30 m-2 border-8 border-zinc-100 rounded-full" />
            </div>
            <div class="flex flex-col justify-center">
                <p class="text-zinc-200 ml-5 mr-5 text-7xl font-bold text-center">
                    VS
                </p>
            </div>
            <div class="flex">
                <img :src="auth.session.avatar" class="w-30 h-30 m-2 border-8 border-zinc-100 rounded-full" />
                <div class="flex justify-center">
                    <div class="flex-col flex justify-center">
                        <p class="text-lg text-center text-zinc-200" >{{ 'username' }}</p>
                        <p class="text-xs text-center text-zinc-400" >W/L : 10-3</p>
                        <p class="text-xs text-center text-zinc-400" >Elo : 1230</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
            </div>
            {{ game.state }}
            <div class="bg-zinc-700 shadow-lg hover:bg-zinc-700 w-full  cursor-pointer rounded-lg flex flex-col justify-center">
                
                
                <PongContainer
                :state="state"/>
            </div>
        </div>
    </div>
</template>