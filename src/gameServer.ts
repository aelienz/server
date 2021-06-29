import cors from "cors";
import "dotenv-safe/config";
import express, { Express } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

export default class GameServer {
	public static readonly PORT = process.env.PORT || 3000;
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

		this.app.use("/", (_, res) => res.send("Hello World!"));

		this.io.on("connection", (socket) => {
			console.log("User connected!");

			socket.on("message-create", ({ content }) => {
				this.io.emit("message-receive", { content });
			});

			socket.on("disconnect", () => {
				console.log("User disconnected");
			});
		});
	}

	public getApp() {
		return this.app;
	}
}
