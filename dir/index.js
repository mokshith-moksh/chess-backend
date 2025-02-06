"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const NewGameManager_1 = require("./NewGameManager");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const gameManager = NewGameManager_1.GameManager.getInstance();
// const cookie = "1234";
// in this taking the cached data froom t
wss.on("connection", function connection(ws) {
    gameManager.addGame(ws);
    ws.on("close", () => {
        gameManager.removeUserFromGame(ws);
    });
});
