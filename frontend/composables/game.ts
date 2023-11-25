
export const useGame = defineStore("game", () => {

    const socket = useSocket();

    const tmpGame = ref({

    })

    const autoClean = ref(null)


  const init = async () => {
    const { notify } = useNotification();

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
}
const challenge = async (destUserId) => {
    socket.emit("game:challenge", destUserId);
}

const acceptChallenge = (gameId) => {
    socket.emit("game:challenge-accept", {gameId})
}
const declineChallenge = (gameId) => {
    socket.emit("game:challenge-decline", {gameId})
}
    return {
        init,
        challenge,
        tmpGame,
        acceptChallenge,
        declineChallenge,
    }
})