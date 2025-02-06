import { WebSocket } from "ws";

export class UserManager {
  private static instance: UserManager;
  private users: Set<WebSocket>;

  private constructor() {
    this.users = new Set();
  }

  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  addUser(socket: WebSocket) {
    this.users.add(socket);
  }

  removeUser(socket: WebSocket) {
    this.users.delete(socket);
  }

  getUsers(): Set<WebSocket> {
    return this.users;
  }
}
