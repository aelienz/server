"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
class GameServer {
    constructor() {
        this.init();
        this.listen();
    }
    init() {
        this.app = express_1.default();
        this.app.use(cors_1.default());
        this.server = http_1.createServer(this.app);
        this.io = new socket_io_1.Server(this.server);
    }
    listen() {
        this.server.listen(GameServer.PORT, () => {
            console.log(`Server started at http://localhost:${GameServer.PORT} !`);
        });
        this.io.on("connection", (socket) => {
            console.log("A user has connected!");
            socket.on("add", ({ num1, num2 }) => {
                this.io.emit("result", num1 + num2);
            });
            socket.on("disconnect", () => {
                console.log("A user has disconnected");
            });
        });
    }
    getApp() {
        return this.app;
    }
}
exports.default = GameServer;
GameServer.PORT = 4000;
//# sourceMappingURL=gameServer.js.map