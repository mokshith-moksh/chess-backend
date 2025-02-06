import { WebSocketServer } from "ws";
import { GameManager } from "./NewGameManager";

const wss = new WebSocketServer({ port: 8080 });
const gameManager = GameManager.getInstance();
// const cookie = "1234";
// in this taking the cached data froom t
wss.on("connection", function connection(ws) {
  gameManager.addGame(ws);
  ws.on("close", () => {
    gameManager.removeUserFromGame(ws);
  });
});
