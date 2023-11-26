<script setup lang="ts">
    const auth = useAuth()
    const game = useGame()
    const route = useRoute()

    const board = ref()

    const init = () => {
        const canvas = board.value as HTMLCanvasElement
        if (canvas === undefined) return
        canvas.style.width ='100%';
        //canvas.style.maxWidth ='800px';
        //canvas.style.minWidth ='600px';
        //canvas.style.minHeight ='450px';
        //canvas.style.maxHeight ='600px';
        canvas.style.height='100%';
        canvas.style.borderColor='white';
        canvas.style.borderWidth='1px';
        canvas.style.borderRadius='8px';

        canvas.width  = canvas.offsetWidth;
        canvas.width  = canvas.offsetWidth;
        canvas.height  = canvas.offsetHeight;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        
        
    }
    //watch(() => props.state, (newVal, oldVal) => {
    //    draw()
    //})

    const draw = () => {
        const canvas = board.value as HTMLCanvasElement
        if (canvas === undefined) return
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D


        ctx.clearRect(0, 0, canvas.width, canvas.height)

        //ctx.fillStyle = props.state.ball.color
        //ctx.fillRect(props.state.ball.x * canvas.width - props.state.ball.w / 2, props.state.ball.y * canvas.height - props.state.ball.h / 2, props.state.ball.w, props.state.ball.h)
        ctx.globalCompositeOperation = 'destination-over';
        // draw the net down the middle), with dashed line
        //ctx.fillStyle = 'white'
        ctx.strokeStyle = 'white'
        ctx.setLineDash([30, 52])
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2, 0)
        ctx.lineTo(canvas.width / 2, canvas.height)
        ctx.lineWidth = 6
        ctx.stroke()


        //draw background
        ctx.globalCompositeOperation = 'source-over';
        
        // write Score on the board
        ctx.font = '80px Arial'
        ctx.fillStyle = '#ffffffa0'

        if (!game.state.left?.userId) return console.log("NO LEFT")
        if (!game.state.right?.userId) return console.log("NO RIGHT")
        //if (!game.state.left?.score) return console.log("NO LEFT")
        //if (!game.state.right?.score) return console.log("NO RIGHT")
        //console.log("NO")
        ctx.fillText(game.state.left.score, canvas.width / 4 - 25, 80)
        ctx.fillText(game.state.right.score, canvas.width / 4 * 3 - 25, 80)

        ////draw the paddles
        ctx.fillStyle = game.state.left.color
        // place in the middle of the screen on the left
        // clearFirst to avoid ghosting
        let leftSize = {
            w: game.state.left.w / 100 * canvas.width,
            h: game.state.left.h / 100 * canvas.height
        }
        ctx.clearRect(5, 5, leftSize.w, canvas.height)
        ctx.fillRect(5, (game.state.left.y * canvas.height) + 5, leftSize.w, leftSize.h)

        ctx.fillStyle = game.state.right.color

        let rightSize = {
            w: game.state.right.w / 100 * canvas.width,
            h: game.state.right.h / 100 * canvas.height
        }
        // place in the middle of the screen on the right
        ctx.clearRect(canvas.width - 5 - rightSize.w, 5, rightSize.w, canvas.height)
        ctx.fillRect(canvas.width - 5 - rightSize.w, rightSize.h + 5, rightSize.w, rightSize.h)

        ////draw the ball
        ctx.fillStyle = game.state.ball.color

        let ballSize = {
            w: game.state.ball.w / 100 * canvas.width,
            h: game.state.ball.h / 100 * canvas.height
        }
        
        ctx.clearRect(game.state.ball.x * canvas.width - ballSize.w / 2, game.state.ball.y * canvas.height - ballSize.w / 2, ballSize.w, ballSize.w)
        ctx.fillRect(game.state.ball.x * canvas.width - ballSize.w / 2, game.state.ball.y * canvas.height - ballSize.w / 2, ballSize.w, ballSize.w)

        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    let intv = ref()
    onMounted(() => {
        init()
        draw()
        intv.value = setInterval(() => {
            draw()
        }, 1000 / 60)
    })

    onBeforeUnmount(() => {
        clearInterval(intv.value)
    })
</script>
<template>
    <div class="w-full h-full mx-auto flex justify-center relative max-w[800px] min-w[600px] min-h[450px] max-h[600px]">
        <!--{{game.state}}-->
        <div v-if="game.state.status == 'ready'">
            <div v-if="game.state?.left"  class="bg-green/40 h-[calc(100%-3.5rem)] mt-[calc(3.5rem/2)] left-[calc(1.8rem)] w-45% rounded absolute z-4 flex items-center justify-center">
            <div  class="w-50" >
                <div class="bg-zinc-700 rounded py-4 px-2"  v-if="game.state.left?.ready == false && game.state.left.userId != auth.session.id">
                    <div >
                        <div class="flex justify-center mx-auto">
                            <div class="animate-bounce h-[16px] w-[16px] bg-zinc-200 rounded-full" ></div>
                        </div>
                        <div class="bg-zinc-200 h-1 w-10 m-2 mx-auto rounded"></div>
                        <p class="text-xs text-zinc-400 text-center">Waiting for ready</p>
                    </div>
                </div>
                <div class="flex justify-center" v-if="game.state.left?.ready === false && game.state.left.userId === auth.session.id">
                    <button @click="game.beReady($route.params.game)" class="bg-zinc-600 w-60 hover:bg-zinc-700 px-2 py-1 m-2 cursor-pointer rounded-lg">
                        <p class="text-zinc-200 text-center">
                            I'm ready
                        </p> 
                    </button>
                </div>
                <div v-else-if="game.state.left?.ready">
                    <div >
                        <div class="flex justify-center mx-auto">
                            <div class="text-3xl  rounded-full p-2.5 b-2" >
                            <div class="text-3xl bg-zinc-200 rounded-full i-mdi:check" ></div>
                        </div>
                        </div>
                        <p class="text-xs mt-5 text-zinc-200 text-center">READY</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="game.state?.right"  class="bg-green/40 h-[calc(100%-3.5rem)] mt-[calc(3.5rem/2)] right-[calc(1.8rem)] w-45% rounded absolute z-4 flex items-center justify-center">
            <div  class="w-50" >
                <div class="bg-zinc-700 rounded py-4 px-2" v-if="game.state.right?.ready == false && game.state.right.userId != auth.session.id">
                    <div >
                        <div class="flex justify-center mx-auto">
                            <div class="animate-bounce h-[16px] w-[16px] bg-zinc-200 rounded-full" ></div>
                        </div>
                        <div class="bg-zinc-200 h-1 w-10 m-2 mx-auto rounded"></div>
                        <p class="text-xs text-zinc-400 text-center">Waiting for ready</p>
                    </div>
                </div>
                <div class="flex justify-center" v-if="game.state.right?.ready === false && game.state.right.userId === auth.session.id">
                    <button @click="game.beReady($route.params.game)" class="bg-zinc-600 w-60 hover:bg-zinc-700 px-2 py-1 m-2 cursor-pointer rounded-lg">
                        <p class="text-zinc-200 text-center">
                            I'm ready
                        </p> 
                    </button>
                </div>
                <div v-else-if="game.state.right?.ready">
                    <div >
                        <div class="flex justify-center mx-auto">
                            <div class="text-3xl  rounded-full p-2.5 b-2" >
                            <div class="text-3xl bg-zinc-200 rounded-full i-mdi:check" ></div>
                        </div>
                        </div>
                        <p class="text-xs mt-5 text-zinc-200 text-center">READY</p>
                    </div>
                </div>
            </div>
        </div>
        </div>
        <div class="p-6 h-full w-full">
            <canvas ref="board" id="pong" class="z-2" ></canvas>
        </div>
    </div>
</template>