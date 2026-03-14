"use strict";

// WebSocket connection

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

					case "pause":
						updateTime(data.pauseTime, true);
						break;

					case "resume":
						updateTime(data.resumeTime, false);
						break;

					case "score":
						updateScore(data.scoreEvent);
						break;
				}
				break;

			default:
				console.log("message", e.data);
				break;
		}
	},
};

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

connect();

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
let timeMultiplier = 1;
let duration = 0;

/** @param {MapInfo} data */
async function updateMapInfo(data) {
	const custom = data.level_id.startsWith("custom_level_");
	const wip = custom && data.level_id.endsWith("WIP");
	cover.src = data.coverRaw ? `data:image/png;base64,${data.coverRaw}` : "images/unknown.svg";
	title.textContent = data.name || "";
	subTitle.textContent = data.sub_name || "";
	artist.textContent = data.artist || "";
	mapper.textContent = data.mapper || "";
	difficulty.textContent = data.difficulty?.replace("Plus", " +") || "";
	characteristic.src = `images/characteristic/${data.characteristic}.svg`;
	difficultyLabel.textContent = ""; // BS+ does not provide label
	type.textContent = !custom ? "OST" : wip ? "WIP" : "";
	bsrKey.textContent = data.BSRKey || "???"; // Always empty?
	timeMultiplier = data.timeMultiplier || 1;
	duration = data.duration / 1000;

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

// Song time

const timeText = document.getElementById("time");
const intervalMs = 500;
let intervalId = 0;
let currentTime = 0;

/** @param {number} time @param {boolean} paused */
function updateTime(time, paused) {
	if (!settings.time) return;
	currentTime = time;
	timeText.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
	clearInterval(intervalId);
	if (paused) return;
	intervalId = window.setInterval(() => {
		currentTime += intervalMs * timeMultiplier / 1000;
		timeText.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
	}, intervalMs);
}

/** @param {number} t */
function formatTime(t) {
	t = Math.floor(t);
	const minutes = Math.floor(t / 60);
	const seconds = t - minutes * 60;
	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Score

const accuracy = document.getElementById("accuracy");
const mistakes = document.getElementById("mistakes");

/** @param {Score} score */
function updateScore(score) {
	if (!settings.score) return;
	accuracy.textContent = (score.accuracy * 100).toFixed(1);
	mistakes.textContent = score.missCount ? String(score.missCount) : "";
	accuracy.classList.toggle("failed", score.currentHealth === 0);
}

// Settings

const settings = {
	cover: true,
	mapInfo: true,
	time: true,
	score: true,
	right: false,
	bottom: false,
	scale: 1,
	fade: 300,
};

const defaults = structuredClone(settings);
const style = document.createElement("style");

function loadSettings() {
	const params = new URLSearchParams(location.hash.slice(1));
	let css = "";
	for (const [key, def] of Object.entries(defaults)) {
		const value = JSON.parse(params.get(key) || "null") ?? def;
		settings[key] = value;
		if (typeof def === "boolean") document.body.classList.toggle(key, value);
		else css += `--${key}: ${value}; `;
	}
	style.textContent = `:root { ${css}}`;
}

function saveSettings() {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(settings))
		if (value !== defaults[key]) params.set(key, JSON.stringify(value));
	location.replace("#" + params.toString());
}

window.onhashchange = loadSettings;
loadSettings();
document.head.appendChild(style);

// Settings UI

for (const key of ["cover", "mapInfo", "time", "score"]) {
	const input = document.getElementById(`${key}Input`);
	input.checked = settings[key];
	input.oninput = () => {
		settings[key] = input.checked;
		saveSettings();
	};
}

const scale = document.getElementById("scaleInput");
scale.valueAsNumber = settings.scale * 100;
scale.oninput = () => {
	settings.scale = scale.valueAsNumber / 100;
	saveSettings();
};

const position = document.getElementById("positionInput");
position.value = JSON.stringify([settings.right, settings.bottom]);
position.onchange = () => {
	[settings.right, settings.bottom] = JSON.parse(position.value);
	saveSettings();
};

const fade = document.getElementById("fadeInput");
fade.valueAsNumber = settings.fade;
fade.oninput = () => {
	settings.fade = fade.valueAsNumber;
	saveSettings();
};

document.documentElement.onclick = e => document.body.classList.toggle("preview");
document.getElementById("settings").onclick = e => e.stopPropagation();
