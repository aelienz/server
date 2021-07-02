import cors from "cors";
import "dotenv-safe/config";
import express, { Express } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { Client, State } from "./lib/types";

export default class GameServer {
	public static readonly PORT = process.env.PORT || 3000;
	public static readonly HEARTBEAT = 30;
	private app: Express;
	private server: HttpServer;
	private io: SocketServer;
	private state: State;

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
			clients: []
		};
	}

	private listen() {
		this.server.listen(GameServer.PORT, () => {
			console.log(`Server started at http://localhost:${GameServer.PORT} !`);
		});

		this.app.use("/", (_, res) => res.send("Hello World!"));

		this.io.sockets.on("connection", (socket) => {
			socket.on("client-join", (client: Client) => {
				this.state.clients.push(client);
			});

			socket.on(
				"player-move",
				({
					socket,
					vel
				}: {
					socket: { id: string };
					vel: { x: number; y: number };
				}) => {
					const transform =
						this.state.clients[
							this.state.clients.findIndex(
								(client) => client.socket.id === socket.id
							)
						].transform;

					transform.x += vel.x;
					transform.y += vel.y;
				}
			);

			socket.on("disconnect", () => {
				this.state.clients = this.state.clients.filter(
					(client) => client.socket.id !== socket.id
				);
			});
		});

		setInterval(() => this.update(), GameServer.HEARTBEAT);
	}

	private update() {
		this.io.emit("heartbeat", JSON.stringify(this.state));
	}
}
