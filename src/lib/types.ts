export interface Player {
	socket: {
		id: string;
	};
	name: string;
}

export interface GameState {
	players: Player[];
}
