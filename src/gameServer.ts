import { GameState, Player, Transform } from "aelienz-types";
import cors from "cors";
import "dotenv-safe/config";
import express, { Express } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

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
			entities: []
		};
	}

	private listen() {
		this.server.listen(GameServer.PORT, () => {
			console.log(`Server started at http://localhost:${GameServer.PORT} !`);
		});

		this.app.use("/", (_, res) => res.send("Hello World!"));

		this.io.sockets.on("connection", (socket) => {
			socket.on(
				"player-join",
				({
					player,
					transform,
					image
				}: {
					player: Player;
					transform: Transform;
					image: string;
				}) => {
					this.state.entities.push({
						socket: { id: socket.id },
						player,
						transform,
						image
					});
				}
			);

			socket.on("player-move", ({ x, y }: { x: number; y: number }) => {
				try {
					const transform =
						this.state.entities[
							this.state.entities.findIndex(
								(entity) => "player" in entity && entity.socket.id === socket.id
							)
						].transform;

					transform.x += x;
					transform.y += y;
				} catch (_) {}
			});

			socket.on("disconnect", () => {
				this.state.entities = this.state.entities.filter(
					(entity) => "player" in entity && entity.socket.id !== socket.id
				);
			});
		});

		setInterval(() => this.update(), GameServer.HEARTBEAT);
	}

	private update() {
		this.io.emit("heartbeat", JSON.stringify(this.state));
	}
}
