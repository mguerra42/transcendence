
export const useGame = defineStore("game", () => {

    const socket = useSocket();

    const tmpGame = ref({

    })

    const autoClean = ref(null)
    const isReady = ref(false)
    const isAvailable = ref(false)
    const state = ref({
        ball: { h: 0, w: 0, x: 0, y: 0, vx: 6, vy: 6 },
        left: {
            h: 0,
            w: 0,
            x: 0,
            y: 0,
            user: {
                
            },
            color: '',
            ready: false,
            score: 0,
            userId: 0,
        },
        right: {
            h: 0,
            w: 0,
            x: 0,
            y: 0,
            user: {
                
            },
            color: '',
            ready: false,
            score: 0,
            userId: 0,
        },
        status: 'started',
    })

    const beReady = (gameId) => {
        socket.emit("game:ready", { gameId })
    }



    const init = async () => {
        const { notify } = useNotification();
        const route = useRoute();

        socket.on("game:challenged", async (data) => {
            tmpGame.value = data;
            autoClean.value = setTimeout(() => {
                tmpGame.value = {};
            }, 15000);
        });
        socket.on("game:challenge-declined", async (data) => {
            tmpGame.value = {};
        });
        socket.on("game:challenge-accepted", async (data) => {
            tmpGame.value = {};
        });

        socket.on("game:start", async (data) => {
            console.log("game:start", data);
            navigateTo({
                name: "game-game",
                params: {
                    game: data,
                },
            })
        });
        socket.on("game:state", async (newState) => {
            console.log("game:state", newState);
            state.value = newState;
        });
        socket.on("game:ready", async (newState) => {
            console.log("game:ready", newState);
            isReady.value = true;
        });

        if (route.params.game) {
            console.log("auto game:connect", route.params.game);
            await connect(route.params.game)
        }
    }
    const challenge = async (destUserId) => {
        socket.emit("game:challenge", destUserId);
    }

    const acceptChallenge = (gameId) => {
        socket.emit("game:challenge-accept", { gameId })
    }
    const declineChallenge = (gameId) => {
        socket.emit("game:challenge-decline", { gameId })
    }
    const connect = async (gameId) => {
        socket.emit("game:connect", { gameId })
    }
    return {
        init,
        state,
        beReady,
        challenge,
        tmpGame,
        acceptChallenge,
        declineChallenge,
        connect,
        isReady
    }
})