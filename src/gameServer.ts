import cors from "cors";
import express, { Express } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

export default class GameServer {
	public static readonly PORT = 4000;
	private app: Express;
	private server: HttpServer;
	private io: SocketServer;

	public constructor() {
		this.init();
		this.listen();
	}

	private init() {
		this.app = express();
		this.app.use(cors());
		this.server = createServer(this.app);
		this.io = new SocketServer(this.server);
	}

	private listen() {
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

	public getApp() {
		return this.app;
	}
}
