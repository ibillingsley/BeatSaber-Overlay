"use strict";
// https://github.com/hardcpp/BeatSaberPlus/wiki/%5BEN%5D-Song-Overlay

const bspUrl = "ws://localhost:2947/socket";
const retryMs = 5000;
let retries = 0;

function connect() {
	console.log(`Connecting to ${bspUrl} (attempt ${retries++})`);
	const ws = new WebSocket(bspUrl);
	ws.onopen = () => console.log("Connection open.");
	ws.onmessage = (e) => {
		const data = JSON.parse(e.data);
		switch (data._type) {
			case "event":
				switch (data._event) {
					case "gameState":
						document.body.className = data.gameStateChanged;
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
	};
	ws.onclose = (e) => {
		console.log(`Connection closed. code: ${e.code}, reason: ${e.reason}, clean: ${e.wasClean}`);
		setTimeout(connect, retryMs);
	};
}

const cover = document.getElementById("cover");
const title = document.getElementById("title");
const subTitle = document.getElementById("subTitle");
const artist = document.getElementById("artist");
const mapper = document.getElementById("mapper");
const difficulty = document.getElementById("difficulty");
const characteristicIcon = document.getElementById("characteristicIcon");
const difficultyLabel = document.getElementById("difficultyLabel");
const bsrKey = document.getElementById("bsrKey");
const type = document.getElementById("type");

/** @param {MapInfoChanged} data */
function updateMapInfo(data) {
	const custom = data.level_id.startsWith("custom_level_");
	cover.style.backgroundImage = data.coverRaw ? `url("data:image/jpeg;base64,${data.coverRaw}")` : "";
	title.textContent = data.name || "";
	subTitle.textContent = data.sub_name || "";
	artist.textContent = data.artist || "";
	mapper.textContent = data.mapper || "";
	difficulty.textContent = data.difficulty.replace("Plus", " +") || "";
	characteristicIcon.setAttribute("src", `images/characteristic/${data.characteristic}.svg`);
	difficultyLabel.textContent = "";
	bsrKey.textContent = data.BSRKey || "";
	type.textContent = !custom ? "OST" : data.level_id.endsWith(" WIP") ? "WIP" : "";

	if (custom) {
		fetch(`https://api.beatsaver.com/maps/hash/${data.level_id.substring(13, 53)}`)
			.then(response => response.json())
			.then(map => {
				if (!map.id) return;
				bsrKey.textContent = map.id;
				mapper.textContent = map.metadata.levelAuthorName; // Replace mapper name with full authors list
				// Find difficulty label
				const diff = map.versions[0].diffs.find(d =>
					d.characteristic === data.characteristic && d.difficulty === data.difficulty
				);
				if (diff.label) difficultyLabel.textContent = diff.label;
			});
	}
}

connect();

document.documentElement.onclick = () => document.body.classList.toggle("Playing");
