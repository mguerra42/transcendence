<script setup lang="ts">
    const props = defineProps<{
        state: any,
    }>();

    const board = ref()

    const init = () => {
        const canvas = board.value as HTMLCanvasElement
        if (canvas === undefined) return
        canvas.style.width ='100%';
        canvas.style.minWidth ='500px';
        canvas.style.minHeight ='500px';
        canvas.style.height='100%';
        canvas.style.borderColor='white';
        canvas.style.borderWidth='1px';
        canvas.style.borderRadius='8px';

        canvas.width  = props.state.canvas.w = canvas.offsetWidth;
        canvas.height  = props.state.canvas.h = canvas.offsetHeight;
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
        ctx.fillText(props.state.left.score, canvas.width / 4 - 25, 80)
        ctx.fillText(props.state.right.score, canvas.width / 4 * 3 - 25, 80)

        ////draw the paddles
        ctx.fillStyle = props.state.left.color
        // place in the middle of the screen on the left
        // clearFirst to avoid ghosting
        ctx.clearRect(5, 5, props.state.left.w, canvas.height)
        ctx.fillRect(5, (props.state.left.y * canvas.height) + 5, props.state.left.w, props.state.left.h)

        ctx.fillStyle = props.state.right.color
        // place in the middle of the screen on the right
        ctx.clearRect(canvas.width - 5 - props.state.right.w, 5, props.state.right.w, canvas.height)
        ctx.fillRect(canvas.width - 5 - props.state.right.w , (props.state.right.y * canvas.height) + 5, props.state.right.w, props.state.right.h)

        ////draw the ball
        ctx.fillStyle = props.state.ball.color
        
        ctx.clearRect(props.state.ball.x * canvas.width - props.state.ball.w / 2, props.state.ball.y * canvas.height - props.state.ball.h / 2, props.state.ball.w, props.state.ball.h)
        ctx.fillRect(props.state.ball.x * canvas.width - props.state.ball.w / 2, props.state.ball.y * canvas.height - props.state.ball.h / 2, props.state.ball.w, props.state.ball.h)

        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    let intv = ref()
    onMounted(() => {
        init()
        intv.value = setInterval(() => {
            draw()
        }, 1000 / 1000)
    })

    onBeforeUnmount(() => {
        clearInterval(intv.value)
    })
</script>
<template>
    <div class="p-12">
        <canvas ref="board" id="pong" ></canvas>
    </div>
</template>