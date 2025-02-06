import { Chess } from "chess.js";
import WebSocket from "ws";
import { GAMEOVER, INIT_GAME, MOVE } from "./messages";

export class GameData {
  public player1: WebSocket;
  public player2: WebSocket;
  public board: Chess;
  public startTime: Date;
  private isWhiteTurn: boolean;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.isWhiteTurn = true;

    // Initialize the game for both players
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "white" },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "black" },
      })
    );
  }

  public makeMove(socket: WebSocket, move: { from: string; to: string }) {
    // Ensure the current player is allowed to move
    if (this.isWhiteTurn && socket !== this.player1) return;
    if (!this.isWhiteTurn && socket !== this.player2) return;
    try {
      const result = this.board.move(move);
      if (!result) {
        socket.send(
          JSON.stringify({
            type: "error",
            payload: { message: "Invalid Move" },
          })
        );
      }
    } catch (error) {
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
      this.player1.send(
        JSON.stringify({ type: GAMEOVER, payload: { winner } })
      );
      this.player2.send(
        JSON.stringify({ type: GAMEOVER, payload: { winner } })
      );
    }
  }

  public broadcastMove(socket: WebSocket, move: any) {
    const currentPosition = this.board.fen();
    const message = JSON.stringify({
      type: MOVE,
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
