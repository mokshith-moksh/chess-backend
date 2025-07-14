// chess-backend/src/NewGameManager.ts
import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { GameData } from "./Game";
import { UserManager } from "./UserManager";

export class GameManager {
  private static instance: GameManager;
  private games: GameData[];
  private pendingUser: WebSocket | null;
  private userManager: UserManager;

  private constructor() {
    this.games = [];
    this.pendingUser = null;
    this.userManager = UserManager.getInstance();
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  addGame(socket: WebSocket) {
    this.userManager.addUser(socket);
    this.addHandler(socket);
    console.log("addGame " + socket);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      let message;
      console.log("Addhandler " + socket);
      // Handle potential JSON parsing errors
      try {
        message = JSON.parse(data.toString());
      } catch (error) {
        console.error("Invalid JSON received:", data.toString()); // Log the malformed data
        socket.send(
          JSON.stringify({
            type: "error",
            payload: { message: "Invalid JSON format" },
          })
        ); // Optionally send an error response to the client

        return; // Exit early to prevent further processing
      }

      if (message.type === INIT_GAME) {
        this.initGame(socket);
      } else if (message.type === MOVE) {
        console.log(message.move);
        this.handleMove(socket, message.move);
      }
    });
  }

  private initGame(socket: WebSocket) {
    console.log("InitGame " + socket);
    if (this.pendingUser) {
      console.log("Game is pushed " + socket);
      const game = new GameData(this.pendingUser, socket);
      this.games.push(game);
      this.pendingUser = null;
    } else {
      console.log("Pending user added " + socket);
      this.pendingUser = socket;
    }
  }

  private handleMove(socket: WebSocket, move: any) {
    const game = this.games.find(
      (g) => g.player1 === socket || g.player2 === socket
    );

    if (game) {
      game.makeMove(socket, move);
    }
  }

  public removeUserFromGame(socket: WebSocket) {
    this.games = this.games.filter((game) => {
      if (game.player1 === socket || game.player2 === socket) {
        if (game.player1 === socket && game.player2) {
          game.player2.send(
            JSON.stringify({
              type: "error",
              payload: { message: "OPPONENT_DISCONNECTED" },
            })
          );
        } else if (game.player2 === socket && game.player1) {
          game.player1.send(
            JSON.stringify({
              type: "error",
              payload: {
                message: "OPPONENT_DISCONNECTED",
              },
            })
          );
        }
        return false;
      }
      return true;
    });
  }
}
