import { GameState, Player, Transform } from "aelienz-types";
import cors from "cors";
import "dotenv-safe/config";
import express, { Express } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import {
	__collisionDamage__,
	__playerHeight__,
	__playerWidth__
} from "./lib/constants";

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
				({ player, transform }: { player: Player; transform: Transform }) => {
					this.state.entities.push({
						socket: { id: socket.id },
						player,
						transform,
						image: "player"
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

					for (const entity of this.state.entities) {
						if (!("player" in entity) || entity.socket.id === socket.id)
							continue;
					}
				} catch (_) {}
			});

			socket.on("disconnect", () => {
				this.removePlayer(socket.id);
			});
		});

		setInterval(() => this.update(), GameServer.HEARTBEAT);
	}

	private update() {
		for (let i = 0; i < this.state.entities.length - 1; i++) {
			const e1 = this.state.entities[i];
			if (!("player" in e1)) continue;

			for (let j = i; j < this.state.entities.length - 1; j++) {
				const e2 = this.state.entities[j + 1];
				if (!("player" in e2)) continue;

				if (
					e1.transform.x < e2.transform.x + __playerWidth__ &&
					e1.transform.x + __playerWidth__ > e2.transform.x &&
					e1.transform.y < e2.transform.y + __playerHeight__ &&
					e1.transform.y + __playerHeight__ > e2.transform.y
				) {
					e1.player.hp -= __collisionDamage__;
					e2.player.hp -= __collisionDamage__;
				}

				if (e1.player.hp <= 0) this.removePlayer(e1.socket.id);
				if (e2.player.hp <= 0) this.removePlayer(e2.socket.id);
			}
		}

		this.io.emit("heartbeat", JSON.stringify(this.state));
	}

	private removePlayer(id: string) {
		this.io.to(id).emit("destroy");

		this.state.entities = this.state.entities.filter(
			(entity) => "player" in entity && entity.socket.id !== id
		);
	}
}
