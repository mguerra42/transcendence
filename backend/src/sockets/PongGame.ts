export class PongGame {
    id: string;
    playersIds: number[] = [];
    players: any[] = [];
    connected: number[] = [];
    db: any;
    state: any;
    send: (type: string, data: any) => void;
    constructor(config, send) {
        this.db = config.db;
        this.id = config.id;
        this.playersIds = config.playersIds;
        this.players = config.players;
        this.connected = [];
        this.state = config.state;
        this.send = send;
        console.log('PongGame created with players: ', this.players);
        this.init();
    }

    async save() {
        console.log('PongGame save');
        await this.db.game.update({
            where: {
                id: this.id,
            },
            data: {
                state: this.state,
            },
        });
        console.log('PongGame save done');
    }

    async init() {
        console.log('PongGame init');
        if (!this.state.left || !Object.keys(this.state.left).length) {
            const [left, right] =
                Math.random() > 0.5
                    ? [this.playersIds[0], this.playersIds[1]]
                    : [this.playersIds[1], this.playersIds[0]];
            this.state = {
                status: 'waiting',
                ball: {
                    x: 0,
                    y: 0,
                    h: 0,
                    w: 0,
                    vx: 6,
                    vy: 6,
                },
                left: {
                    userId: left,
                    user: this.players.find((p) => p.id === left),
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0,
                    color: '',
                    score: 0,
                },
                right: {
                    userId: right,
                    user: this.players.find((p) => p.id === right),
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0,
                    color: '',
                    score: 0,
                },
            };
            await this.save();
        }

        this.state.status = 'waiting';

        // Start the game by sending all players to the game page
        this.send('game:start', this.id);

        setInterval(() => {
            this.send('game:state', this.state);
        }, 1000);
        // Check if all users are ready
        console.log('PongGame init done');
    }

    connect(userId) {
        if (
            !this.connected.includes(userId) &&
            this.playersIds.includes(userId)
        ) {
            this.connected.push(userId);
        }

        if (this.connected.length === this.playersIds.length) {
            this.getReady();
        }

        this.send('game:state', this.state);
        console.log('PongGame connect', userId);
    }

    getReady() {
        console.log('PongGame getReady');
        // Send all players to the game page
        this.send('game:ready', {});
        // Check if all users are ready
        console.log('PongGame getReady done');
    }
}
