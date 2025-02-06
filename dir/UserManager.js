"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
class UserManager {
    constructor() {
        this.users = new Set();
    }
    static getInstance() {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }
    addUser(socket) {
        this.users.add(socket);
    }
    removeUser(socket) {
        this.users.delete(socket);
    }
    getUsers() {
        return this.users;
    }
}
exports.UserManager = UserManager;
