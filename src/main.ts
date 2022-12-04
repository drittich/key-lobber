import '@picocss/pico';
import './style.css'

let naturalNotes = [
	['C', 'C']
	, ['D', 'D']
	, ['E', 'E']
	, ['F', 'F']
	, ['G', 'G']
	, ['A', 'A']
	, ['B', 'B']
];

let sharpNotes = [
	['C♯', 'C sharp']
	, ['D♯', 'D sharp']
	, ['F♯', 'F sharp']
	, ['G♯', 'G sharp']
	, ['A♯', '"A" sharp']
];

let flatNotes = [
	['D♭', 'D flat']
	, ['E♭', 'E flat']
	, ['G♭', 'G flat']
	, ['A♭', '"A" flat']
	, ['B♭', 'B flat']
];

let isLobbing = false;

let enableSpeechCheckboxEl = $('enableSpeech') as HTMLInputElement;
let flatNotesCheckboxEl = $("flatNotes") as HTMLInputElement;
let keyContainerEl = $('keyContainer') as HTMLElement;
let keyValueEl = $('keyValue') as HTMLElement;
let keyIntervalInputEl = $('keyInterval') as HTMLInputElement;
let keyIntervalValueEl = $('keyIntervalValue') as HTMLElement;
let naturalNotesCheckboxEl = $("naturalNotes") as HTMLInputElement;
let noteOrderSelectEl = $('noteOrder') as HTMLSelectElement;
let noteOrderSpacerEl = $('noteOrderSpacer') as HTMLElement;
let pregressBarEl = $("elapsedPerThousand") as HTMLProgressElement;
let sharpNotesCheckboxEl = $("sharpNotes") as HTMLInputElement;
let startNoteLabelEl = $('startNoteLabel') as HTMLElement;
let startNoteSelectEl = $('startNote') as HTMLSelectElement;
let toggleLobbingButtonEl = $('toggleLobbing') as HTMLButtonElement;
let voiceOptionsSelectEl = $('voiceOptions') as HTMLSelectElement;
let volumeInputEl = $('volume') as HTMLInputElement;
let volumeValueEl = $('volumeValue') as HTMLElement;
let voiceOptionsContainerEl = $('voiceOptionsContainer') as HTMLElement;

init();

function init() {
	loadVoices();
	updateUiWithSavedSettings();
	setupHandlers();
}

function updateUiWithSavedSettings() {
	getKeyIntervalFromLocalStorage();
	getNoteSelectionFromLocalStorage();
	getEnableAudioFromLocalStorage();
	getNoteOrderFromLocalStorage();
	populateStartNoteOptions();
	getVolumeFromLocalStorage();
}

function loadVoices() {
	speechSynthesis.addEventListener("voiceschanged", () => {
		let voices = speechSynthesis.getVoices();
		voices.forEach(voice => {
			var option = document.createElement('option');

			option.value = voice.name;
			option.innerHTML = voice.name;
			voiceOptionsSelectEl.appendChild(option);
		});
		getVoiceFromLocalStorage();
	})
}

function setupHandlers() {
	// when keyInterval changes, update the keyIntervalValue
	keyIntervalInputEl!.addEventListener('input', function () {
		keyIntervalValueEl!.innerHTML = (this as HTMLInputElement).value;
	});

	//when enableSpeech is unchecked, hide the voiceOptions
	enableSpeechCheckboxEl!.addEventListener('change', function () {
		let checked = (this as HTMLInputElement).checked;
		voiceOptionsContainerEl.style.display = checked ? 'block' : 'none';
		localStorage.setItem("enableSpeech", checked.toString());
	});

	//when we change the voice, save the value to local storage
	voiceOptionsSelectEl.addEventListener("change", function () {
		var voice = voiceOptionsSelectEl.value;
		localStorage.setItem("voice", voice);
	});

	//when we change the key interval, save the value to local storage
	keyIntervalInputEl!.addEventListener("change", function () {
		// get the key interval
		var keyInterval = keyIntervalInputEl.value;
		// save the key interval to local storage
		localStorage.setItem("keyInterval", keyInterval);
	});

	//when we change the notes selections, save the values to local storage
	naturalNotesCheckboxEl.addEventListener("change", function () {
		localStorage.setItem("naturalNotes", naturalNotesCheckboxEl.checked.toString());
		populateStartNoteOptions();
	});
	flatNotesCheckboxEl.addEventListener("change", function () {
		localStorage.setItem("flatNotes", flatNotesCheckboxEl.checked.toString());
		populateStartNoteOptions();
	});
	sharpNotesCheckboxEl.addEventListener("change", function () {
		localStorage.setItem("sharpNotes", sharpNotesCheckboxEl.checked.toString());
		populateStartNoteOptions();
	});

	//when we change the note order, save the values to local storage
	noteOrderSelectEl!.addEventListener("change", function () {
		let noteOrder = noteOrderSelectEl.value;
		localStorage.setItem("noteOrder", noteOrder);
		startNoteLabelEl!.style.display = noteOrder == "random" ? 'none' : 'block';
		noteOrderSpacerEl!.style.display = noteOrder == "random" ? 'block' : 'none';
	});

	//when we change the start note, save the values to local storage
	startNoteSelectEl!.addEventListener("change", function () {
		let startNote = startNoteSelectEl.value;
		localStorage.setItem("startNote", startNote);
	});

	// setup click handler for start-lobbing
	toggleLobbingButtonEl.addEventListener("click", function () {
		if (isLobbing) {
			stopKeyLobber();
			isLobbing = false;
		}
		else {
			// get the key interval
			let keyInterval = keyIntervalInputEl.value;
			// start the key lobber
			startKeyLobber(parseInt(keyInterval));
			isLobbing = true;
		}
	});

	// when volume changes, update the volumeValue
	volumeInputEl!.addEventListener('input', function () {
		volumeValueEl!.innerHTML = Math.round(parseFloat(volumeInputEl.value) * 100).toString();
	});

	//when we change the volume, save the value to local storage
	volumeInputEl!.addEventListener("change", function () {
		let value = volumeInputEl.value;
		localStorage.setItem("volume", value);
	});
}

function getKeyIntervalFromLocalStorage() {
	let keyIntervalValue = localStorage.getItem('keyInterval');
	if (keyIntervalValue) {
		// set key interval
		keyIntervalInputEl.value = keyIntervalValue;
	}
	else {
		// set default key interval
		keyIntervalInputEl.value = '15';
	}
	keyIntervalValueEl!.innerHTML = keyIntervalInputEl.value;
}

function getNoteSelectionFromLocalStorage() {
	let checked = localStorage.getItem('naturalNotes');
	if (checked == null)
		checked = "false";
	naturalNotesCheckboxEl.checked = checked == "true";

	checked = localStorage.getItem('flatNotes');
	if (checked == null)
		checked = "false";
	flatNotesCheckboxEl.checked = checked == "true";

	checked = localStorage.getItem('sharpNotes');
	if (checked == null)
		checked = "false";
	sharpNotesCheckboxEl.checked = checked == "true";

	if (!sharpNotesCheckboxEl.checked && !flatNotesCheckboxEl.checked && !naturalNotesCheckboxEl.checked) {
		naturalNotesCheckboxEl.checked = true;
		flatNotesCheckboxEl.checked = true;
		sharpNotesCheckboxEl.checked = true;
	}
}

function getEnableAudioFromLocalStorage() {
	let checked = localStorage.getItem('enableSpeech');
	if (checked == null)
		checked = "false";
	enableSpeechCheckboxEl.checked = checked == "true";
	voiceOptionsContainerEl.style.display = checked == "true" ? 'block' : 'none';
}

function getNoteOrderFromLocalStorage() {
	let noteOrder = localStorage.getItem('noteOrder');
	if (noteOrder == null)
		noteOrder = "ascending";
	noteOrderSelectEl.value = noteOrder;
	startNoteLabelEl!.style.display = noteOrder == "random" ? 'none' : 'block';
	noteOrderSpacerEl!.style.display = noteOrder == "random" ? 'block' : 'none';
}

function getVolumeFromLocalStorage() {
	let volume = localStorage.getItem('volume');
	if (volume == null)
		volume = "0.75";
	volumeInputEl.value = volume;
	volumeValueEl!.innerHTML = Math.round(parseFloat(volume) * 100).toString();
}

function getStartNoteFromLocalStorage() {
	let startNote = localStorage.getItem('startNote');

	//if startnote is not available, then set it to the first note in the list
	let notes = getNotes();
	let found = false;
	for (let i = 0; i < notes.length; i++) {
		if (notes[i][0] == startNote) {
			found = true;
			break;
		}
	}
	if (found)
		startNoteSelectEl.value = startNote!;
	else
		startNoteSelectEl.value = startNoteSelectEl.getElementsByTagName('option')[0].value;
}

function getNotes() {
	let notes: string[][] = [];
	if (naturalNotesCheckboxEl.checked)
		notes = notes.concat(naturalNotes);
	if (flatNotesCheckboxEl.checked)
		notes = notes.concat(flatNotes);
	if (sharpNotesCheckboxEl.checked)
		notes = notes.concat(sharpNotes);

	return notes;
}
function populateStartNoteOptions() {
	let notes = getNotes();
	//sort the notes with the flats coming first, then naturals, then sharps
	notes.sort((a, b) => {
		if (a[0] == b[0])
			return 0;
		if (a[0] == "flat")
			return -1;
		if (b[0] == "flat")
			return 0;
		if (a[0] == "natural")
			return -1;
		if (b[0] == "natural")
			return 1;
		if (a[0] == "sharp")
			return 1;
		if (b[0] == "sharp")
			return -1;
		return 0;
	});

	startNoteSelectEl.innerHTML = "";
	notes.forEach(note => {
		var option = document.createElement('option');

		option.value = note[0];
		option.innerHTML = note[0];
		startNoteSelectEl.appendChild(option);
	});
	getStartNoteFromLocalStorage();
}

function getVoiceFromLocalStorage() {
	let voice = localStorage.getItem('voice');
	if (voice == null)
		voiceOptionsSelectEl.value = voiceOptionsSelectEl.getElementsByTagName('option')[0].value;
	else
		voiceOptionsSelectEl.value = voice;
}

let timer: number;
function startKeyLobber(intervalSeconds: number) {
	showKey(true);
	getKey(intervalSeconds * 1000)

	// set the timer
	timer = setInterval(function () {
		getKey(intervalSeconds * 1000)
	}, intervalSeconds * 1000);

	toggleLobbingButtonEl.innerHTML = "Stop";
	keyIntervalInputEl.disabled = true;
	toggleLobbingButtonEl.classList.add("secondary");
}

function stopKeyLobber() {
	showKey(false);
	// stop the timers
	clearInterval(timer);
	clearInterval(bgTimer);

	toggleLobbingButtonEl.innerHTML = "Start";
	keyIntervalInputEl.disabled = false;
	toggleLobbingButtonEl.classList.remove("secondary");
}

let bgTimer: number;
let elapsedMs = 0;
function getKey(intervalMs: number) {
	clearInterval(bgTimer);
	let key = getRandomKey();
	keyValueEl.innerHTML = key[0];
	elapsedMs = 0;

	if (enableSpeechCheckboxEl.checked) {
		let utterance = new SpeechSynthesisUtterance(key[1]);
		utterance.pitch = 1;
		utterance.rate = .9;
		utterance.volume = parseFloat(volumeInputEl.value);

		// If a voice has been selected, find the voice and set the
		// utterance instance's voice attribute.
		if (voiceOptionsSelectEl.value)
			utterance.voice = speechSynthesis.getVoices().filter(function (voice) { return voice.name == voiceOptionsSelectEl.value; })[0];

		speechSynthesis.speak(utterance);
	}

	//slowly increase the background size until the next key is selected
	let frameMs = 10;
	bgTimer = setInterval(frame, frameMs);
	function frame() {
		if (elapsedMs >= intervalMs) {
			clearInterval(bgTimer);
		} else {
			elapsedMs += frameMs;
			pregressBarEl.value = Math.round((elapsedMs / intervalMs) * 1000);
		}
	}
}

let currentKey = ["C", "C"];
function getRandomKey() {
	var keys = getNotes();
	let nextKey = null;

	do {
		let randomIndex = Math.floor(Math.random() * keys.length);
		nextKey = keys[randomIndex];
	} while (nextKey[0] == currentKey[0]);
	currentKey = nextKey;
	return currentKey;
}

function showKey(show:boolean) {
	keyContainerEl.style.display = show ? 'block' : 'none';
	$('keyIntervalLabel')!.style.display = show ? 'none': 'block' ;
	$('noteSelectionFieldset')!.style.display = show ? 'none' : 'block';
	$('noteOrderFieldset')!.style.display = show ? 'none' : 'block';
	$('voiceSelectContainer')!.style.display = show ? 'none' : 'block';
	$('elapsedPerThousand')!.style.display = show ? 'block' : 'none';
}

function $(id: string) {
	return document.getElementById(id);
}