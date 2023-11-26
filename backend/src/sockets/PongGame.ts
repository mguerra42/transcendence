import { is } from '@babel/types';

export class PongGame {
    id: string;
    playersIds: number[] = [];
    players: any[] = [];
    connected: number[] = [];
    db: any;
    state: any;
    isPaused: boolean;
    send: (type: string, data: any) => void;
    constructor(config, send) {
        this.db = config.db;
        this.id = config.id;
        this.playersIds = config.playersIds;
        this.players = config.players;
        this.connected = [];
        this.state = config.state;
        this.isPaused = true;
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
                    x: 0.5,
                    y: 0.5,
                    h: 2,
                    w: 2,
                    vx: 100 / (60 * 5) / 100,
                    vy: 100 / (60 * 5) / 100,
                    color: 'white',
                },
                left: {
                    userId: left,
                    ready: false,
                    user: this.players.find((p) => p.id === left),
                    x: 0,
                    y: 0,
                    w: 2,
                    h: 15,
                    color: 'white',
                    score: 0,
                },
                right: {
                    userId: right,
                    ready: false,
                    user: this.players.find((p) => p.id === right),
                    x: 0,
                    y: 0,
                    w: 2,
                    h: 15,
                    color: 'white',
                    score: 0,
                },
            };
            await this.save();
        }

        if (this.connected.length === this.playersIds.length) {
            this.getReady();
        }

        // Start the game by sending all players to the game page
        this.send('game:start', this.id);

        //setInterval(() => {
        //    this.send('game:state', this.state);
        //}, 1000);
        //setInterval(() => {
        //    console.log('PongGame IDLE', this.id);
        //}, 1000);
        // Check if all users are ready
        console.log('PongGame init done');
    }
    async onDisconnect(userId) {
        if (this.connected.includes(userId)) {
            this.connected = this.connected.filter((id) => id !== userId);
        }
        this.isPaused = true;
        const side = this.state.left.userId === userId ? 'left' : 'right';
        this.state[side].user.status = 'offline';
        this.state[side].user.online = false;
        this.state[side].ready = false;
        this.state.left.ready = false;
        this.state.right.ready = false;
        this.state.status = 'waiting';

        await this.save();
        //this.state.status = 'idle';

        this.send('game:state', this.state);
        console.log('PongGame disconnect', userId);
    }

    async connect(userId) {
        if (
            !this.connected.includes(userId) &&
            this.playersIds.includes(userId)
        ) {
            this.connected.push(userId);
            const side = this.state.left.userId === userId ? 'left' : 'right';
            this.state[side].user.status = 'online';
            this.state[side].user.online = true;
            await this.save();
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
        this.state.status = 'ready';
        const interval = setInterval(() => {
            this.send('game:ready', {});

            if (
                this.state.left.ready &&
                this.state.right.ready &&
                this.state.status === 'ready'
            ) {
                clearInterval(interval);
                this.start();
            }
        }, 1000);
        // Check if all users are ready
        console.log('PongGame getReady done');
    }

    setReady(userId) {
        if (this.playersIds.includes(userId)) {
            const side = this.state.left.userId === userId ? 'left' : 'right';
            this.state[side].ready = true;
            this.send('game:state', this.state);
        }

        if (
            this.state.left.ready &&
            this.state.right.ready &&
            this.state.status === 'ready'
        ) {
            this.start();
        }
    }

    async start() {
        console.log('PongGame start');
        // Send all players to the game page
        this.state.status = 'started';
        this.isPaused = false;
        this.state = {
            status: 'started',
            ball: {
                x: 0.5,
                y: 0.5,
                h: 2,
                w: 2,
                vx: 0.005,
                vy: 0.005,
                color: 'white',
            },
            left: {
                userId: this.state.left.userId,
                ready: false,
                user: this.players.find((p) => p.id === this.state.left.userId),
                x: 0,
                y: 0,
                w: 2,
                h: 20,
                color: 'white',
                score: 0,
            },
            right: {
                userId: this.state.right.userId,
                ready: false,
                user: this.players.find(
                    (p) => p.id === this.state.right.userId,
                ),
                x: 0,
                y: 0,
                w: 2,
                h: 20,
                color: 'white',
                score: 0,
            },
        };
        await this.save();
        //return this.getReady();
        while (!this.isPaused) {
            //console.log('PongGame start', this.state.ball.x, this.state.ball.y);
            console.log('PongGame start', this.state.ball.x, this.state.ball.y);
            console.log(
                'PongGame start',
                this.state.ball.vx,
                this.state.ball.vy,
            );
            //let realX = state.value.ball.x * state.value.canvas.w
            //if (realX + state.value.ball.w >= state.value.canvas.w) {
            //    state.value.ball.velX = -state.value.ball.velX
            //}
            //if (realX - state.value.ball.w  <= 0) {
            //    state.value.ball.velX = -state.value.ball.velX
            //}
            //let realY = state.value.ball.y * state.value.canvas.h
            //if (realY + state.value.ball.h >= state.value.canvas.h) {
            //    state.value.ball.velY = -state.value.ball.velY
            //}
            //if (realY - state.value.ball.h <= 0) {
            //    state.value.ball.velY = -state.value.ball.velY
            //}
            //state.value.ball.x += state.value.ball.velX / state.value.canvas.w;
            //state.value.ball.y += state.value.ball.velY / state.value.canvas.h;
            const ballSize = +(this.state.ball.w / 100);
            if (this.state.ball.x + this.state.ball.vx > 1) {
                console.log('x > 1');
                this.state.ball.vx = -this.state.ball.vx;
            }
            if (this.state.ball.x - Math.abs(this.state.ball.vx) <= 0) {
                console.log('x < 0');
                this.state.ball.vx = -this.state.ball.vx;
            }
            if (this.state.ball.y + this.state.ball.vy > 1) {
                this.state.ball.vy = -this.state.ball.vy;
            }
            if (this.state.ball.y - Math.abs(this.state.ball.vy) <= 0) {
                this.state.ball.vy = -this.state.ball.vy;
            }
            this.state.ball.x += this.state.ball.vx;
            //    state.value.ball.x += state.value.ball.velX / state.value.canvas.w
            //    state.value.ball.y += state.value.ball.velY / state.value.canvas.h
            this.state.ball.y += this.state.ball.vy;
            await this.save();
            this.send('game:state', this.state);
            await new Promise((resolve) => setTimeout(resolve, 1000 / 60));
        }
        //this.state.ball.x = 0.5;
        //this.state.ball.y = 0.5;
        //this.state.ball.color = 'white';
        //this.state.left.color = 'white';
        //this.state.left.color = 'white';
        //await this.save();
        //this.send('game:state', this.state);

        // Check if all users are ready
        console.log('PongGame start done');
    }
}
