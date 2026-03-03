"use strict";

// Data providers

const beatSaberPlus = {
	// https://github.com/hardcpp/BeatSaberPlus/wiki/%5BEN%5D-Song-Overlay
	url: "ws://localhost:2947/socket",

	/** @param {MessageEvent<string>} e */
	onMessage: function(e) {
		/** @type {BeatSaberPlusEvent} */
		const data = JSON.parse(e.data);
		switch (data._type) {
			case "event":
				switch (data._event) {
					case "gameState":
						document.body.dataset.gameState = data.gameStateChanged;
						break;

					case "mapInfo":
						updateMapInfo(data.mapInfoChanged);
						break;
				}
				break;

			default:
				console.log("message", e.data);
				break;
		}
	},
};

// WebSocket connection

const provider = beatSaberPlus;
const retryMs = 10000;
let retries = 0;

function connect() {
	console.log(`Connecting to ${provider.url} (attempt ${retries++})`);
	const ws = new WebSocket(provider.url);
	ws.onopen = onOpen;
	ws.onmessage = provider.onMessage;
	ws.onclose = onClose;
}

function onOpen() {
	console.log("Connection open.");
	retries = 0;
}

/** @param {CloseEvent} e */
function onClose(e) {
	console.log(`Connection closed. code: ${e.code}, reason: ${e.reason}, clean: ${e.wasClean}`);
	setTimeout(connect, retryMs);
}

// Map info

const cover = document.getElementById("coverImg");
const title = document.getElementById("title");
const subTitle = document.getElementById("subTitle");
const artist = document.getElementById("artist");
const mapper = document.getElementById("mapper");
const difficulty = document.getElementById("difficulty");
const characteristic = document.getElementById("characteristicImg");
const difficultyLabel = document.getElementById("difficultyLabel");
const type = document.getElementById("type");
const bsrKey = document.getElementById("bsrKey");

/** @param {MapInfoChanged} data */
async function updateMapInfo(data) {
	const custom = data.level_id.startsWith("custom_level_");
	const wip = custom && data.level_id.endsWith("WIP");
	cover.src = data.coverRaw ? `data:image/jpeg;base64,${data.coverRaw}` : "images/unknown.svg";
	title.textContent = data.name || "";
	subTitle.textContent = data.sub_name || "";
	artist.textContent = data.artist || "";
	mapper.textContent = data.mapper || "";
	difficulty.textContent = data.difficulty.replace("Plus", " +") || "";
	characteristic.src = `images/characteristic/${data.characteristic}.svg`;
	difficultyLabel.textContent = ""; // BS+ does not provide label
	type.textContent = !custom ? "OST" : wip ? "WIP" : "";
	bsrKey.textContent = data.BSRKey || "???"; // Always empty?

	// Fetch extra info from BeatSaver
	if (custom && !wip) {
		document.body.classList.add("loading");
		try {
			const response = await fetch(`https://api.beatsaver.com/maps/hash/${data.level_id.substring(13, 53)}`);
			const map = await response.json();
			if (!map.id) return;
			bsrKey.textContent = map.id;
			mapper.textContent = map.metadata.levelAuthorName; // Replace mapper name with full authors list
			// Find difficulty label
			const diff = map.versions[0].diffs.find(d =>
				d.characteristic === data.characteristic && d.difficulty === data.difficulty
			);
			if (diff.label) difficultyLabel.textContent = diff.label;
		} finally {
			document.body.classList.remove("loading");
		}
	}
}

connect();

document.documentElement.onclick = () => document.body.classList.toggle("preview");
