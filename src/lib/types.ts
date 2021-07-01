export interface Player {
	socket: {
		id: string;
	};
	name: string;
}

export interface Transform {
	x: number;
	y: number;
	rotation: number;
}

export interface PlayerData {
	player: Player;
	transform: Transform;
}

export interface GameState {
	players: PlayerData[];
}
