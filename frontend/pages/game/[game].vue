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

    let playerLeft = computed(() => {
        return game.state.left || {}
    })
    let playerRight = computed(() => {
        return game.state.right || {}
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

            <PongBanner :gameId="$route.params.game" :state="game.state" />

           
            </div>
            <div class="bg-zinc-700 shadow-lg hover:bg-zinc-700 w-full  cursor-pointer rounded-lg flex flex-col justify-center">
                <PongContainer
                :state="game.state"/>
            </div>
        </div>
    </div>
</template>