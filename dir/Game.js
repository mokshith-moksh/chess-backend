"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameData = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class GameData {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.isWhiteTurn = true;
        // Initialize the game for both players
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: { color: "white" },
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: { color: "black" },
        }));
    }
    makeMove(socket, move) {
        // Ensure the current player is allowed to move
        if (this.isWhiteTurn && socket !== this.player1)
            return;
        if (!this.isWhiteTurn && socket !== this.player2)
            return;
        try {
            const result = this.board.move(move);
            if (!result) {
                socket.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Invalid Move" },
                }));
            }
        }
        catch (error) {
            console.log(error);
            socket.send(JSON.stringify({ type: "error", message: "Invalid move" }));
            return;
        }
        // Switch turns after a valid move
        this.isWhiteTurn = !this.isWhiteTurn;
        this.broadcastMove(socket, move);
        // Check for game over
        if (this.board.isGameOver()) {
            const winner = this.isWhiteTurn ? "black" : "white";
            this.player1.send(JSON.stringify({ type: messages_1.GAMEOVER, payload: { winner } }));
            this.player2.send(JSON.stringify({ type: messages_1.GAMEOVER, payload: { winner } }));
        }
    }
    broadcastMove(socket, move) {
        const currentPosition = this.board.fen();
        const message = JSON.stringify({
            type: messages_1.MOVE,
            payload: move,
            currentTurn: this.isWhiteTurn ? "white" : "black",
            currentPosition,
        });
        // Send move only to the opponent
        this.player1.send(message);
        this.player2.send(message);
        // Future Redis integration for spectators
        // redisClient.publish("chess-moves", message);
    }
}
exports.GameData = GameData;
