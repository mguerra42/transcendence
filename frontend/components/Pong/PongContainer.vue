<template>
    <PongMatchmaking         :containerProps="componentProps"/>
    <Pong v-if="auth.logged" :containerProps="componentProps"/>
</template>

<script setup lang="ts">
    const auth = useAuth()

    const componentProps = {
        auth: useAuth(),
        client: useClient(),
        socket: useSocket(),

        //MISC. VARIABLES
        canvas: ref(),
        context: ref(),
        timeElapsed: ref(0),
        animationFrameId: ref(),
        MatchmakingError: ref('Matchmaking : An error occured.'),

        //COMPONENTS
        showMatchmakingError: ref(false),
        showPlayButton: ref(true),
        showPong: ref(false),
        showLoader: ref(false),
        showMatchFound: ref(false),

        //MATCH CONFIRM
        gameLobbyId: ref(""),
        matchAccepted: ref(false),
        matchDeclined: ref(false),
        opponentDeclined: ref(false),
        opponentAccepted: ref(false),
        opponentProfile: ref<{ username?: string; id?: string; socketId?: string; avatarPath?: string; }>({}),
        
        //MATCHMAKING FUNCTIONS
        waitForMatch: async() => {
            //hide play button when waiting for match
            componentProps.showPlayButton.value = false;

            //show loading screen when waiting for match
            componentProps.showLoader.value = true;

            //update time count every second
            const timeElapsedInterval = setInterval(() => {
            componentProps.timeElapsed.value++;
            }, 1000);

            //add in game queue
            await componentProps.client.game.addToGameQueue(componentProps.auth.session.username)

            //wait for match to be found
            const matchOpponent:any = await componentProps.client.game.findAMatch(componentProps.auth.session.username);
            if (matchOpponent === null)
            {
                //if match isn't found, return null and show error
                componentProps.MatchmakingError.value = 'No players available.'
                //reset time count
                clearInterval(timeElapsedInterval);
                componentProps.timeElapsed.value = 0;
                return null;
            }
            else
            {
                //update the opponent profile if match is found
                componentProps.opponentProfile.value.username = matchOpponent.profile?.username;
                componentProps.opponentProfile.value.avatarPath = matchOpponent.profile?.avatarPath;
                componentProps.opponentProfile.value.id = matchOpponent.profile?.id;
                componentProps.opponentProfile.value.socketId = matchOpponent.profile?.socketId;
                //addtogamelobby
                //return game lobby
                clearInterval(timeElapsedInterval);
                componentProps.timeElapsed.value = 0;
            }
            return matchOpponent;
        },

        waitForConfirm: async () => {
            componentProps.showMatchFound.value = true;
            componentProps.timeElapsed.value = 10;
            const timeElapsedInterval = setInterval(() => {
                componentProps.timeElapsed.value--;
            }, 1000);
            componentProps.showLoader.value = false;
            await Promise.race([
                new Promise<void>(timeout => setTimeout(timeout, 10000)),
                new Promise<void>(resolve => {
                    const checkMatchAccepted = () => {
                        if (componentProps.matchAccepted.value === true && componentProps.opponentAccepted.value === true)
                        {
                            resolve();
                        }
                        else if (componentProps.opponentDeclined.value === true && componentProps.matchDeclined.value === false)
                        {
                            resolve();
                        }
                        else if (componentProps.matchDeclined.value === true && componentProps.opponentDeclined.value === false)
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
            componentProps.timeElapsed.value = 0;
        },

        resetMatchmakingWindow: async () => {
            componentProps.showMatchFound.value = false;
            componentProps.matchAccepted.value = false;
            componentProps.matchDeclined.value = false;
            componentProps.opponentAccepted.value = false;
            componentProps.opponentDeclined.value = false;
        },
    };

    onMounted(async () => {
        await componentProps.socket.connect()
    })
</script>