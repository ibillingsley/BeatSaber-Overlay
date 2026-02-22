// https://github.com/hardcpp/BeatSaberPlus/wiki/%5BEN%5D-Song-Overlay

interface HandshakeEvent {
	"_type": "handshake";
	"protocolVersion": number;
	"gameVersion": string;
	"playerName": string;
	"playerPlatformId": string;
}

interface GameStateEvent {
	"_type": "event";
	"_event": "gameState";
	"gameStateChanged": "Menu" | "Playing";
}

interface ResumeEvent {
	"_type": "event";
	"_event": "resume";
	"resumeTime": number;
}

interface PauseEvent {
	"_type": "event";
	"_event": "pause";
	"pauseTime": number;
}

interface MapInfoChangedEvent {
	"_type": "event";
	"_event": "mapInfo";
	"mapInfoChanged": {
		"level_id": string;
		"name": string;
		"sub_name": string;
		"artist": string;
		"mapper": string;
		"characteristic": string;
		"difficulty": string;
		"duration": number;
		"BPM": number;
		"PP": number;
		"BSRKey": string;
		"coverRaw": string;
		"time": number;
		"timeMultiplier": number;
	};
}

interface ScoreEvent {
	"_type": "event";
	"_event": "score";
	"scoreEvent": {
		"time": number;
		"score": number;
		"accuracy": number;
		"combo": number;
		"missCount": number;
		"currentHealth": number;
	};
}

type BeatSaberPlusEvent = HandshakeEvent | GameStateEvent | ResumeEvent | PauseEvent | MapInfoChangedEvent | ScoreEvent;
type MapInfoChanged = MapInfoChangedEvent["mapInfoChanged"];

interface Document {
	// Assume non-null
	getElementById(elementId: `${string}Icon`): HTMLImageElement;
	getElementById(elementId: string): HTMLElement;
}
