"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const messages_1 = require("./messages");
const Game_1 = require("./Game");
const UserManager_1 = require("./UserManager");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.userManager = UserManager_1.UserManager.getInstance();
    }
    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
    addGame(socket) {
        this.userManager.addUser(socket);
        this.addHandler(socket);
        console.log("addGame " + socket);
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            let message;
            console.log("Addhandler " + socket);
            // Handle potential JSON parsing errors
            try {
                message = JSON.parse(data.toString());
            }
            catch (error) {
                console.error("Invalid JSON received:", data.toString()); // Log the malformed data
                socket.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Invalid JSON format" },
                })); // Optionally send an error response to the client
                return; // Exit early to prevent further processing
            }
            if (message.type === messages_1.INIT_GAME) {
                this.initGame(socket);
            }
            else if (message.type === messages_1.MOVE) {
                console.log(message.move);
                this.handleMove(socket, message.move);
            }
        });
    }
    initGame(socket) {
        console.log("InitGame " + socket);
        if (this.pendingUser) {
            console.log("Game is pushed " + socket);
            const game = new Game_1.GameData(this.pendingUser, socket);
            this.games.push(game);
            this.pendingUser = null;
        }
        else {
            console.log("Pending user added " + socket);
            this.pendingUser = socket;
        }
    }
    handleMove(socket, move) {
        const game = this.games.find((g) => g.player1 === socket || g.player2 === socket);
        if (game) {
            game.makeMove(socket, move);
        }
    }
    removeUserFromGame(socket) {
        this.games = this.games.filter((game) => {
            if (game.player1 === socket || game.player2 === socket) {
                if (game.player1 === socket && game.player2) {
                    game.player2.send(JSON.stringify({
                        type: "error",
                        payload: { message: "OPPONENT_DISCONNECTED" },
                    }));
                }
                else if (game.player2 === socket && game.player1) {
                    game.player1.send(JSON.stringify({
                        type: "error",
                        payload: {
                            message: "OPPONENT_DISCONNECTED",
                        },
                    }));
                }
                return false;
            }
            return true;
        });
    }
}
exports.GameManager = GameManager;
