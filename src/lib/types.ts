export interface Transform {
	x: number;
	y: number;
	rotation: number;
}

export interface Player {
	name: string;
}

export interface Client {
	socket: {
		id: string;
	};
	player: Player;
	transform: Transform;
}

export interface State {
	clients: Client[];
}
