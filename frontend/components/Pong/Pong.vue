<template>
    <button @click="startGame()" v-if="showPlayButton" class="bg-zinc-700 px-3 py-1 m-1 text-zinc-200 rounded-lg"> Play </button>
    <div class="">
        <canvas v-show="showPong" tabindex="0" @keydown.down="player1MoveDown" @keydown.up="player1MoveUp" class="bg-zinc-300 focus-outline-none rounded-lg cursor-crosshair" id="canvas"></canvas>
    </div>
    <!-- Loading animation-->
    <div v-if="showLoader" class="w-50">
        <div class="bg-zinc-700 rounded py-4 px-2">
            <div v-if="!showMatchmakingError">
                <div class="flex justify-center mx-auto">
                    <div class="animate-bounce h-[16px] w-[16px] bg-zinc-200 rounded-full" v-if="showLoader"></div>
                </div>
                <div class="bg-zinc-200 h-1 w-10 m-2 mx-auto rounded"></div>
                <p class="text-xs text-zinc-400 text-center">Waiting for an opponent...</p>
                <p class="text-xs text-zinc-400 text-center">00:0{{ timeElapsed }}</p>
            </div>
            <div v-else class="flex justify-center">
                <p class="text-xs text-zinc-200 text-center">{{ MatchmakingError }}</p>
            </div>
        </div>
    </div>
    <!-- Accept match window-->
    <div v-if="matchFound" @click="acceptMatch" class="bg-zinc-600 hover:bg-zinc-700 w-50 h-70 cursor-pointer rounded-lg">
        <p class="text-zinc-200 m-2 text-2xl font-bold text-center">
            Match found
        </p>
        <div class="flex mt-1 justify-center">
            <div>
                <img :src="opponentProfile.avatarPath" class="w-20 h-20 m-2 rounded-full" />
                <div class="flex justify-center">
                    <div class="flex-col flex justify-center">
                        <p class="text-lg text-center text-zinc-200" >{{ opponentProfile.username }}</p>
                        <p class="text-xs text-center text-zinc-400" >W/L : 10-3</p>
                        <p class="text-xs text-center text-zinc-400" >Elo : 1230</p>
                    </div>
                </div>
            </div>
        </div>
        <p class="text-2xl font-bold text-zinc-200 mb-1 mt-4 text-center">
            {{ timeElapsed }}
        </p>
    </div>
    <div v-if="matchFound" @click="declineMatch" class="bg-zinc-600 w-40 hover:bg-zinc-700 px-2 py-1 m-2 cursor-pointer rounded-lg">
        <p class="text-zinc-200 text-center">
            Decline
        </p>
    </div>
</template>

<script setup lang="ts">

    const opponentProfile : Ref<{ username?: string; avatar?: string;}> = ref({});
    const opponentDeclined = ref(false);
    const opponentAccepted = ref(false);
    const showMatchmakingError = ref(false);
    const showPlayButton = ref(true);
    const MatchmakingError = ref('Matchmaking : An error occured.');
    const showPong = ref(false);
    const showLoader = ref(false);
    const matchFound = ref(false)
    const matchAccepted = ref(false)
    const matchDeclined = ref(false)
    const timeElapsed = ref(0);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    const animationFrameId = ref();
    const canvas = ref();
    const context = ref();
    
    const client = useClient();
    const auth = useAuth();
    const socket = useSocket();

    await socket.connect();
    
    // MATCHMAKING CODE

    const acceptMatch = () => {
        matchAccepted.value = true;
        socket.emit('matchmakingConfirm', {player: auth.session.username, confirm: 'accept'})
    }

    const declineMatch = () => {
        matchDeclined.value = true;
        socket.emit('matchmakingConfirm', {player: auth.session.username, confirm: 'decline'})
    }

    const stopMatchmaking = () => {
        showLoader.value = false;
    }

    const waitForMatch = async () => {
        showPlayButton.value = false;

        showLoader.value = true;
        const timeElapsedInterval = setInterval(() => {
        timeElapsed.value++;
        }, 1000);

        await client.game.addToGameQueue(auth.session.username)
        const matchOpponent:any = await client.game.findAMatch(auth.session.username);
        if (matchOpponent === null)
        {
            MatchmakingError.value = 'No players available.'
            clearInterval(timeElapsedInterval);
            timeElapsed.value = 0;
            return null;
        }
        opponentProfile.value.username = matchOpponent.profile.username;
        opponentProfile.value.avatarPath = matchOpponent.profile.avatarPath;
        clearInterval(timeElapsedInterval);
        timeElapsed.value = 0;
        return matchOpponent;
    }

    const waitForConfirm = async () => {
        matchFound.value = true;
        timeElapsed.value = 10;
        const timeElapsedInterval = setInterval(() => {
            timeElapsed.value--;
        }, 1000);
        showLoader.value = false;
        await Promise.race([
            new Promise<void>(timeout => setTimeout(timeout, 10000)),
            new Promise<void>(resolve => {
                const checkMatchAccepted = () => {
                    if (matchAccepted.value === true && opponentAccepted.value === true)
                        resolve();
                    else if (opponentDeclined.value === true && matchDeclined.value === false)
                    {
                        resolve();
                        opponentDeclined.value = false;
                    }
                    else if (matchDeclined.value === true && opponentDeclined.value === false)
                    {
                        resolve();
                    }
                    else
                        setTimeout(checkMatchAccepted, 100);
                };
                checkMatchAccepted();
            }),   
        ]);
        clearInterval(timeElapsedInterval);
    }

    const startGame = async () => {
        const player = auth.session;
        if (showPong.value === false) {
            const ret = await waitForMatch();
            if (ret === null)
            {
                await client.game.removeFromGameQueue(auth.session.username)
                showMatchmakingError.value = true;
                await new Promise(timeout => setTimeout(timeout, 2000));
                showLoader.value = false;
                showMatchmakingError.value = false;
                matchFound.value = false;
                matchAccepted.value = false;
                matchDeclined.value = false;
                showPlayButton.value = true;
                timeElapsed.value = 0;
                return ;
            }
            await waitForConfirm();
            if (matchAccepted.value === true && opponentAccepted.value === true)
            {
                showPong.value = true;
                matchFound.value = false;
                matchAccepted.value = false;
                matchDeclined.value = false;
                showPlayButton.value = true;
                opponentAccepted.value = false;
                timeElapsed.value = 0;
                await client.game.removeFromGameQueue(auth.session.username)
                gameLoop();
            }
            matchFound.value = false;
            matchAccepted.value = false;
            matchDeclined.value = false;
            showPlayButton.value = true;
            opponentAccepted.value = false;
            opponentDeclined.value = false;
            timeElapsed.value = 0;
            await client.game.removeFromGameQueue(auth.session.username)
        } else {
            resetGame();
            cancelAnimationFrame(animationFrameId.value);
            matchFound.value = false;
            matchAccepted.value = false;
            matchDeclined.value = false;
            showPong.value = false;
            showPlayButton.value = true;
            opponentAccepted.value = false;
            opponentDeclined.value = false;
            timeElapsed.value = 0;
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
            socket.emit('playerMovement', {
                player: auth.session.username,
                move:'moveDown' 
            });
            refreshCanvas();
        }
    }

    const player1MoveUp = (event:any) => {
        if (event.key === 'ArrowUp' && Player1.value.y > 20) { // Use 'ArrowDown' instead of 'Down'
            Player1.value.y -= 15;
            socket.emit('playerMovement', {
                player: auth.session.username,
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
        context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
        context.value.fillRect(Player1.value.x, Player1.value.y, Player1.value.width, Player1.value.height);
        context.value.fillRect(Player2.value.x, Player2.value.y, Player2.value.width, Player2.value.height);
        context.value.fillRect(Ball.value.x, Ball.value.y, Ball.value.width, Ball.value.height)
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
        context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
        context.value.fillStyle = "blue";
        context.value.fillRect(Player1.value.x, Player1.value.y, Player1.value.width, Player1.value.height);
        context.value.fillRect(Player2.value.x, Player2.value.y, Player2.value.width, Player2.value.height);
        context.value.fillRect(Ball.value.x, Ball.value.y, Ball.value.width, Ball.value.height);


        // Call the game loop recursively
        animationFrameId.value = requestAnimationFrame(gameLoop);
    }

    onMounted(() => {
        canvas.value = document.getElementById("canvas");
        context.value = canvas.value.getContext("2d");
        
        canvas.value.width = 800;
        canvas.value.height = 600;
        
        context.value.fillStyle = "blue";
        context.value.fillRect(Player1.value.x, Player1.value.y, Player1.value.width, Player1.value.height)
        context.value.fillRect(Player2.value.x, Player2.value.y, Player2.value.width, Player2.value.height)
        context.value.fillRect(Ball.value.x, Ball.value.y, Ball.value.width, Ball.value.height)
        socket.on('playerMovementResponse', (data: any) => {
            if (data.player !== auth.session.username)
            {
                if (data.move === 'moveUp')
                    player2MoveUp();
                else
                    player2MoveDown();
            }
        });

        socket.on('matchmakingConfirmResponse', (data: any) => {
            if (data.player !== auth.session.username)
            {
                if (data.confirm === 'decline')
                    opponentDeclined.value = true;
                if (data.confirm === 'accept')
                    opponentAccepted.value = true;
            }
        });
    });
</script>