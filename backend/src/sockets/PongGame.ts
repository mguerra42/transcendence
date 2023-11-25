export class PongGame {
    id: string;
    players: number[] = [];
    send: (type: string, data: any) => void;
    constructor(config, send) {
        this.id = config.gameId;
        this.players = config.players;
        this.send = send;
        console.log('PongGame created with players: ', this.players);
        this.init();
    }

    init() {
        console.log('PongGame init');
        // Start the game by sending all players to the game page
        this.send('game:start', this.id);
        // Check if all users are ready
        console.log('PongGame init done');
    }
}
