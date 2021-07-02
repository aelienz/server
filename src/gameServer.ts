import cors from "cors";
import "dotenv-safe/config";
import express, { Express } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { GameState, Player } from "./lib/types";

export default class GameServer {
	public static readonly PORT = process.env.PORT || 3000;
	public static readonly HEARTBEAT = 20;
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
				this.state.players.push({
					player,
					transform: { x: 0, y: 0, rotation: 0 }
				});
			});

			socket.on(
				"player-move",
				({
					player,
					vel
				}: {
					player: Player;
					vel: { x: number; y: number };
				}) => {
					try {
						const transform =
							this.state.players[
								this.state.players.indexOf(
									this.state.players.find(
										(data) => data.player.socket.id === player.socket.id
									)
								)
							].transform;

						transform.x += vel.x;
						transform.y += vel.y;
					} catch (_) {}
				}
			);

			socket.on("disconnect", () => {
				this.state.players = this.state.players.filter(
					(data) => data.player.socket.id !== socket.id
				);
			});
		});

		setInterval(() => this.update(), GameServer.HEARTBEAT);
	}

	private update() {
		this.io.emit("heartbeat", this.state);
	}

	public getApp() {
		return this.app;
	}
}
