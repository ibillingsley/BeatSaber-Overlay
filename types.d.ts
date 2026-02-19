interface Document {
	getElementById(elementId: string): HTMLElement;
}

interface MapInfoChanged {
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
}
