<template>
    <button @click="startGame()" v-if="containerProps.showPlayButton.value" class="bg-zinc-700 px-3 py-1 m-1 text-zinc-200 rounded-lg"> Play </button>
    <div class="">
        <canvas v-show="containerProps.showPong.value" tabindex="0" @keydown.down="player1MoveDown" @keydown.up="player1MoveUp" class="bg-zinc-300 focus-outline-none rounded-lg cursor-crosshair" id="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
    const startGame = async () => {
        const player = containerProps.auth.session;
        if (containerProps.showPong.value === false) {
            const ret = await containerProps.waitForMatch();
            //Couldnt find a match
            if (ret === null)
            {
                containerProps.showLoader.value = false;
                await containerProps.client.game.removeFromGameQueue(containerProps.auth.session.username)
                containerProps.showMatchmakingError.value = true;
                await new Promise(timeout => setTimeout(timeout, 2000));
                containerProps. showMatchmakingError.value = false;
                containerProps.resetMatchmakingWindow()
                containerProps.showPlayButton.value = true;
                return ;
            }

            await containerProps.waitForConfirm();
            if (containerProps.matchAccepted.value === true && containerProps.opponentAccepted.value === true)
            {
                containerProps.showPong.value = true;
                containerProps.showPlayButton.value = true;
                containerProps.resetMatchmakingWindow()
                await containerProps.client.game.removeFromGameQueue(containerProps.auth.session.username)
                gameLoop();
            }
            //Match non confirmed
            containerProps.showPlayButton.value = true;
            containerProps.resetMatchmakingWindow()
            //remove from queue 
            await containerProps.client.game.removeFromGameQueue(containerProps.auth.session.username)
        }
        //Exit running game
        else 
        {
            resetGame();
            cancelAnimationFrame(containerProps.animationFrameId.value);
            containerProps.showPong.value = false;
            containerProps.showPlayButton.value = true;
            containerProps.resetMatchmakingWindow()
        }
    }

    //PONG CODE

    let Player1 = ref({
        width: 15,
        height: 70,
        x: 25,
        y: 20
    })

    let Player2 = ref({
        width: 15,
        height: 70,
        x: 800 - 35,
        y: 20
    })

    let Ball = ref({
        width: 20,
        height: 20,
        x: 390,
        y: 290,
        velocityX: 5, // Horizontal velocity (positive moves right, negative moves left)
        velocityY: 5  // Vertical velocity (positive moves down, negative moves up)
    })


    const resetGame = () => {
        //reinitialize values here
    }

    const player1MoveDown = (event:any) => {
        if (event.key === 'ArrowDown' && Player1.value.y < 500) { // Use 'ArrowDown' instead of 'Down'
            Player1.value.y += 15;
            containerProps.socket.emit('playerMovement', {
                player: containerProps.auth.session.username,
                move:'moveDown' 
            });
            refreshCanvas();
        }
    }

    const player1MoveUp = (event:any) => {
        if (event.key === 'ArrowUp' && Player1.value.y > 20) { // Use 'ArrowDown' instead of 'Down'
            Player1.value.y -= 15;
            containerProps.socket.emit('playerMovement', {
                player: containerProps.auth.session.username,
                move:'moveUp' 
            });
            refreshCanvas();
        }
    }

    const player2MoveDown = () => {
        if(Player2.value.y < 500)
            Player2.value.y += 20;
        refreshCanvas();
    }

    const player2MoveUp = () => {
        if(Player2.value.y > 20)
            Player2.value.y -= 20;
        refreshCanvas();
    }

    const refreshCanvas = () => {
        containerProps.context.value.clearRect(0, 0, containerProps.canvas.value.width, containerProps.canvas.value.height);
        containerProps.context.value.fillRect(Player1.value.x, Player1.value.y, Player1.value.width, Player1.value.height);
        containerProps.context.value.fillRect(Player2.value.x, Player2.value.y, Player2.value.width, Player2.value.height);
        containerProps.context.value.fillRect(Ball.value.x, Ball.value.y, Ball.value.width, Ball.value.height)
    };

    const gameLoop = () => {
        // Update the Ball's position based on its velocity
        Ball.value.x += Ball.value.velocityX;
        Ball.value.y += Ball.value.velocityY;
        
        // Check for collision with Player1
        if (
            Ball.value.x < Player1.value.x + Player1.value.width &&
            Ball.value.x + Ball.value.width > Player1.value.x &&
            Ball.value.y < Player1.value.y + Player1.value.height &&
            Ball.value.y + Ball.value.height > Player1.value.y
        ) {
            // Ball collided with Player1, reverse its horizontal velocity
            Ball.value.velocityX = -Ball.value.velocityX;
        }

        // Check for collision with Player2
        if (
            Ball.value.x < Player2.value.x + Player2.value.width &&
            Ball.value.x + Ball.value.width > Player2.value.x &&
            Ball.value.y < Player2.value.y + Player2.value.height &&
            Ball.value.y + Ball.value.height > Player2.value.y
        ) {
            // Ball collided with Player2, reverse its horizontal velocity
            Ball.value.velocityX = -Ball.value.velocityX;
        }

        //Bounds collission
        if (Ball.value.x >780)
        {
            Ball.value.x = 390;
            Ball.value.y = 290;
            Ball.value.velocityX = 0;
            Ball.value.velocityY = 0;
            setTimeout(() => {
                const randomDirectionX = Math.random() > 0.5 ? 1 : -1; // Randomly choose 1 or -1
                const randomDirectionY = Math.random() > 0.5 ? 1 : -1; // Randomly choose 1 or -1

                Ball.value.velocityX = 5 * randomDirectionX;
                Ball.value.velocityY = 5 * randomDirectionY;
            }, 1000)
        }
        if (Ball.value.y >580)
            Ball.value.velocityY = Ball.value.velocityY * -1;
        if (Ball.value.x < 0)
        {
            Ball.value.x = 390;
            Ball.value.y = 290;
            Ball.value.velocityX = 0;
            Ball.value.velocityY = 0;
            setTimeout(() => {
                const randomDirectionX = Math.random() > 0.5 ? 1 : -1; // Randomly choose 1 or -1
                const randomDirectionY = Math.random() > 0.5 ? 1 : -1; // Randomly choose 1 or -1

                Ball.value.velocityX = 5 * randomDirectionX;
                Ball.value.velocityY = 5 * randomDirectionY;
            }, 1000)
        }
        if (Ball.value.y < 0)
            Ball.value.velocityY = Ball.value.velocityY * -1;

        // Clear and redraw the Ball on the canvas
        containerProps.context.value.clearRect(0, 0, containerProps.canvas.value.width, containerProps.canvas.value.height);
        containerProps.context.value.fillStyle = "blue";
        containerProps.context.value.fillRect(Player1.value.x, Player1.value.y, Player1.value.width, Player1.value.height);
        containerProps.context.value.fillRect(Player2.value.x, Player2.value.y, Player2.value.width, Player2.value.height);
        containerProps.context.value.fillRect(Ball.value.x, Ball.value.y, Ball.value.width, Ball.value.height);

        // Call the game loop recursively
        containerProps.animationFrameId.value = requestAnimationFrame(gameLoop);
    }

    const { containerProps } = defineProps<{
        containerProps: any;
    }>();
    
    onMounted(() => {
        containerProps.canvas.value = document.getElementById("canvas");
        containerProps.context.value = containerProps.canvas.value.getContext("2d");
        
        containerProps.canvas.value.width = 800;
        containerProps.canvas.value.height = 600;
        
        containerProps.context.value.fillStyle = "blue";
        containerProps.context.value.fillRect(Player1.value.x, Player1.value.y, Player1.value.width, Player1.value.height)
        containerProps.context.value.fillRect(Player2.value.x, Player2.value.y, Player2.value.width, Player2.value.height)
        containerProps.context.value.fillRect(Ball.value.x, Ball.value.y, Ball.value.width, Ball.value.height)
        containerProps.socket.on('playerMovementResponse', (data: any) => {
            if (data.player !== containerProps.auth.session.username)
            {
                if (data.move === 'moveUp')
                    player2MoveUp();
                else
                    player2MoveDown();
            }
        });

        containerProps.socket.on('matchmakingConfirmResponse', (data: any) => {
            if (data.player !== containerProps.auth.session.username)
            {
                if (data.confirm === 'decline')
                containerProps.opponentDeclined.value = true;
                if (data.confirm === 'accept')
                containerProps.opponentAccepted.value = true;
            }
        });
    });
</script>
