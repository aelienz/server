import cors from "cors";
import "dotenv-safe/config";
import express, { Express } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { GameState, Player } from "./lib/types";

export default class GameServer {
	public static readonly PORT = process.env.PORT || 3000;
	private app: Express;
	private server: HttpServer;
	private io: SocketServer;
	private state: GameState;

	public constructor() {
		this.init();
		this.listen();
	}

	private init() {
		this.app = express();
		this.app.use(cors());
		this.server = createServer(this.app);
		this.io = new SocketServer(this.server);

		this.state = {
			players: []
		};
	}

	private listen() {
		this.server.listen(GameServer.PORT, () => {
			console.log(`Server started at http://localhost:${GameServer.PORT} !`);
		});

		this.app.use("/", (_, res) => res.send("Hello World!"));

		this.io.sockets.on("connection", (socket) => {
			socket.on("player-join", (player: Player) => {
				this.state.players.push(player);

				this.io.emit("add-player", player);
				this.io.to(player.socket.id).emit("load-players", this.state.players);
			});

			socket.on("disconnect", () => {
				this.state.players = this.state.players.filter(
					(player) => player.socket.id !== socket.id
				);
				this.io.emit("remove-player", socket.id);
			});
		});
	}

	public getApp() {
		return this.app;
	}
}
