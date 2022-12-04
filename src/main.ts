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
	['C#', 'C sharp']
	, ['D#', 'D sharp']
	, ['F#', 'F sharp']
	, ['G#', 'G sharp']
	, ['A#', '"A" sharp']
];

let flatNotes = [
	['Db', 'D flat']
	, ['Eb', 'E flat']
	, ['Gb', 'G flat']
	, ['Ab', '"A" flat']
	, ['Bb', 'B flat']
];

let isLobbing = false;
let pregressBar = (document.getElementById("elapsedPerThousand") as HTMLProgressElement);
let voiceOptionsSelect = (document.getElementById('voiceOptions') as HTMLSelectElement);
let toggleLobbingButton = (document.getElementById('toggleLobbing') as HTMLButtonElement);
let naturalNotesCheckbox = (document.getElementById("naturalNotes") as HTMLInputElement);
let sharpNotesCheckbox = (document.getElementById("sharpNotes") as HTMLInputElement);
let flatNotesCheckbox = (document.getElementById("flatNotes") as HTMLInputElement);

init();

function init() {
	loadVoices();
	updateUiFromLocalStorage();
	setupHandlers();
}

function updateUiFromLocalStorage() {
	getKeyIntervalFromLocalStorage();
	getNoteSelectionFromLocalStorage();
	getEnableAudioFromLocalStorage();
	getNoteOrderFromLocalStorage();
	populateStartNoteOptions();


	// get voice
	// get note selections
	// get note order
	// get starting note
}

function loadVoices() {
	speechSynthesis.addEventListener("voiceschanged", () => {
		let voices = speechSynthesis.getVoices();
		voices.forEach(voice => {
			var option = document.createElement('option');

			option.value = voice.name;
			option.innerHTML = voice.name;
			voiceOptionsSelect.appendChild(option);
		});
		getVoiceFromLocalStorage();
	})
}

function setupHandlers() {
	// when keyInterval changes, update the keyIntervalValue
	document.getElementById('keyInterval')!.addEventListener('input', function () {
		document.getElementById('keyIntervalValue')!.innerHTML = (this as HTMLInputElement).value;
	});

	//when enableSpeech is unchecked, hide the voiceOptions
	document.getElementById('enableSpeech')!.addEventListener('change', function () {
		let checked = (this as HTMLInputElement).checked;
		voiceOptionsSelect.style.display = checked ? 'block' : 'none';
		localStorage.setItem("enableSpeech", checked.toString());
	});

	//when we change the voice, save the value to local storage
	voiceOptionsSelect.addEventListener("change", function () {
		var voice = voiceOptionsSelect.value;
		localStorage.setItem("voice", voice);
	});

	//when we change the key interval, save the value to local storage
	document.getElementById("keyInterval")!.addEventListener("change", function () {
		// get the key interval
		var keyInterval = (document.getElementById("keyInterval") as HTMLInputElement).value;
		// save the key interval to local storage
		localStorage.setItem("keyInterval", keyInterval);
	});

	//when we change the notes selections, save the values to local storage
	document.getElementById("naturalNotes")!.addEventListener("change", function () {
		let checked = (document.getElementById("naturalNotes") as HTMLInputElement).checked;
		localStorage.setItem("naturalNotes", checked.toString());
		populateStartNoteOptions();
	});
	document.getElementById("flatNotes")!.addEventListener("change", function () {
		let checked = (document.getElementById("flatNotes") as HTMLInputElement).checked;
		localStorage.setItem("flatNotes", checked.toString());
		populateStartNoteOptions();
	});
	document.getElementById("sharpNotes")!.addEventListener("change", function () {
		let checked = (document.getElementById("sharpNotes") as HTMLInputElement).checked;
		localStorage.setItem("sharpNotes", checked.toString());
		populateStartNoteOptions();
	});

	//when we change the note order, save the values to local storage
	document.getElementById("noteOrder")!.addEventListener("change", function () {
		let noteOrder = (document.getElementById("noteOrder") as HTMLInputElement).value;
		localStorage.setItem("noteOrder", noteOrder);
		document.getElementById("startNoteLabel")!.style.display = noteOrder == "random" ? 'none' : 'block';
		document.getElementById("noteOrderSpacer")!.style.display = noteOrder == "random" ? 'block' : 'none';
	});

	//when we change the start note, save the values to local storage
	document.getElementById("startNote")!.addEventListener("change", function () {
		let startNote = (document.getElementById("startNote") as HTMLInputElement).value;
		localStorage.setItem("startNote", startNote);
	});

	// setup click handler for start-lobbing
	toggleLobbingButton.addEventListener("click", function () {
		if (isLobbing) {
			stopKeyLobber();
			isLobbing = false;
		}
		else {
			// get the key interval
			let keyInterval = (document.getElementById("keyInterval") as HTMLSelectElement).value;
			// start the key lobber
			startKeyLobber(parseInt(keyInterval));
			isLobbing = true;
		}
	});
}

function getKeyIntervalFromLocalStorage() {
	let keyInterval = localStorage.getItem('keyInterval');
	let rangeEl = document.getElementById('keyInterval') as HTMLInputElement;
	if (keyInterval) {
		// set key interval
		rangeEl.value = keyInterval;
	}
	else {
		// set default key interval
		rangeEl.value = '15';
	}
	document.getElementById('keyIntervalValue')!.innerHTML = rangeEl.value;
}

function getNoteSelectionFromLocalStorage() {
	let checked = localStorage.getItem('naturalNotes');
	if (checked == null)
		checked = "false";
	naturalNotesCheckbox.checked = checked == "true";

	checked = localStorage.getItem('flatNotes');
	if (checked == null)
		checked = "false";
	flatNotesCheckbox.checked = checked == "true";

	checked = localStorage.getItem('sharpNotes');
	if (checked == null)
		checked = "false";
	sharpNotesCheckbox.checked = checked == "true";

	if (!sharpNotesCheckbox.checked && !flatNotesCheckbox.checked && !naturalNotesCheckbox.checked) {
		naturalNotesCheckbox.checked = true;
		flatNotesCheckbox.checked = true;
		sharpNotesCheckbox.checked = true;
	}
}

function getEnableAudioFromLocalStorage() {
	let checked = localStorage.getItem('enableSpeech');
	if (checked == null)
		checked = "false";
	(document.getElementById("enableSpeech") as HTMLInputElement).checked = checked == "true";
	voiceOptionsSelect.style.display = checked == "true" ? 'block' : 'none';
}

function getNoteOrderFromLocalStorage() {
	let noteOrder = localStorage.getItem('noteOrder');
	if (noteOrder == null)
		noteOrder = "ascending";
	(document.getElementById("noteOrder") as HTMLInputElement).value = noteOrder;
	document.getElementById("startNoteLabel")!.style.display = noteOrder == "random" ? 'none' : 'block';
	document.getElementById("noteOrderSpacer")!.style.display = noteOrder == "random" ? 'block' : 'none';
}

function getStartNoteFromLocalStorage() {
	let startNote = localStorage.getItem('startNote');
	let selectEl = (document.getElementById("startNote") as HTMLSelectElement);

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
		selectEl.value = startNote!;
	else
		selectEl.value = selectEl.getElementsByTagName('option')[0].value;
}

function getNotes() {
	let notes: string[][] = [];
	if ((document.getElementById("naturalNotes") as HTMLInputElement).checked)
		notes = notes.concat(naturalNotes);
	if ((document.getElementById("flatNotes") as HTMLInputElement).checked)
		notes = notes.concat(flatNotes);
	if ((document.getElementById("sharpNotes") as HTMLInputElement).checked)
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

	let startNote = document.getElementById("startNote") as HTMLInputElement;
	startNote.innerHTML = "";
	notes.forEach(note => {
		var option = document.createElement('option');

		option.value = note[0];
		option.innerHTML = note[0];
		startNote.appendChild(option);
	});
	getStartNoteFromLocalStorage();
}

function getVoiceFromLocalStorage() {
	let voice = localStorage.getItem('voice');
	if (voice == null)
		voiceOptionsSelect.value = voiceOptionsSelect.getElementsByTagName('option')[0].value;
	else
		voiceOptionsSelect.value = voice;
}

let timer:number;
function startKeyLobber(intervalSeconds: number) {
	getKey(intervalSeconds * 1000)

	// set the timer
	timer = setInterval(function () {
		getKey(intervalSeconds * 1000)
	}, intervalSeconds * 1000);

	toggleLobbingButton.innerHTML = "Stop Lobbing";
	(document.getElementById("keyInterval") as HTMLInputElement).disabled = true;
	toggleLobbingButton.classList.add("secondary");
}

function stopKeyLobber() {
	// stop the timers
	clearInterval(timer);
	clearInterval(bgTimer);

	toggleLobbingButton.innerHTML = "Start Lobbing";
	(document.getElementById("keyInterval") as HTMLSelectElement).disabled = false;
	toggleLobbingButton.classList.remove("secondary");
}

let bgTimer: number;
let elapsedMs = 0;
function getKey(intervalMs: number) {
	clearInterval(bgTimer);
	let key = getRandomKey();
	document.getElementById("key")!.innerHTML = key[0];
	elapsedMs = 0;

	if ((document.getElementById("enableSpeech") as HTMLInputElement).checked) {
		let utterance = new SpeechSynthesisUtterance(key[1]);
		utterance.pitch = 1;
		utterance.rate = .9;

		// If a voice has been selected, find the voice and set the
		// utterance instance's voice attribute.
		if (voiceOptionsSelect.value) 
			utterance.voice = speechSynthesis.getVoices().filter(function (voice) { return voice.name == voiceOptionsSelect.value; })[0];

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
			pregressBar.value = Math.round((elapsedMs / intervalMs) * 1000);
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