/**
 * Handles Web Audio playback and SVG animation for the Mii Dialogue stage.
 * @module miiAnimator
 */

import { renderMii } from './lib/miiRenderer.js';

let audioContext;
let websocket;
let isDialogueActive = false;

// We'll store the current configuration of the two talking Miis here
let activeMiis = {
  mii1: null,
  mii2: null
};

// State mapping
let agentStates = {
  mii1: 'IDLE',
  mii2: 'IDLE'
};

// Queue for incoming PCM buffers
const audioQueue = {
  mii1: [],
  mii2: []
};

let nextPlayTime = {
  mii1: 0,
  mii2: 0
};

// Visual tracking
let lastMouthSwap = 0;
let lastBlink = 0;
let isBlinking = false;

const MOUTH_SHAPES_SPEAKING = ['open', 'teeth', 'smile', 'megaMouth'];

export function initDialogue(mii1, mii2, topic, onStateChange, onTranscript) {
  activeMiis.mii1 = mii1;
  activeMiis.mii2 = mii2;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  isDialogueActive = true;
  agentStates.mii1 = 'IDLE';
  agentStates.mii2 = 'IDLE';
  nextPlayTime.mii1 = audioContext.currentTime;
  nextPlayTime.mii2 = audioContext.currentTime;
  globalAudioQueue = [];
  isPlayingQueue = false;

  websocket = new WebSocket('ws://localhost:8000/ws');

  websocket.onopen = () => {
    onStateChange('Connected! Initializing agents...');
    
    const traitsToText = (p) => {
      if (!p) return "";
      let parts = [];
      if (p.introvertExtrovert < 33) parts.push("very introverted");
      else if (p.introvertExtrovert > 66) parts.push("very extroverted");
      
      if (p.calmIntense < 33) parts.push("very calm");
      else if (p.calmIntense > 66) parts.push("very intense");
      
      if (p.seriousSilly < 33) parts.push("very serious");
      else if (p.seriousSilly > 66) parts.push("very silly");
      
      return parts.length ? `You are ${parts.join(', and ')}.` : "";
    };

    const personality1 = `${traitsToText(mii1.personality)} ${mii1.meta?.notes || ''}`.trim();
    const personality2 = `${traitsToText(mii2.personality)} ${mii2.meta?.notes || ''}`.trim();

    websocket.send(JSON.stringify({
      action: 'start',
      mii1: { name: mii1.name, voice: mii1.meta?.voice || 'Aoede', personality: personality1 },
      mii2: { name: mii2.name, voice: mii2.meta?.voice || 'Kore', personality: personality2 },
      topic: topic
    }));
  };

  let hasError = false;

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'system') {
      onStateChange(data.message);
    } else if (data.type === 'error') {
      hasError = true;
      onStateChange('Error: ' + data.message);
      stopDialogue();
    } else if (data.type === 'state') {
      agentStates[data.agent] = data.state;
      if (data.state === 'SPEAKING') {
        onStateChange(`${activeMiis[data.agent].name} is speaking...`);
      }
    } else if (data.type === 'transcript') {
      onTranscript(data.agent, data.text);
    } else if (data.type === 'transcript_partial') {
      onTranscript(data.agent, data.text, true);
    } else if (data.type === 'audio') {
      playAudio(data.agent, data.data);
    }
  };

  websocket.onerror = (err) => {
    console.error('WebSocket Error', err);
    hasError = true;
    onStateChange('WebSocket Error. Is the Python server running?');
  };

  websocket.onclose = () => {
    if (!hasError) {
      onStateChange('Disconnected.');
    }
    stopDialogue();
  };

  // Start animation loop
  requestAnimationFrame(animationLoop);
}

export function stopDialogue() {
  isDialogueActive = false;
  if (websocket) {
    websocket.close();
    websocket = null;
  }
}

// Convert base64 to Float32Array PCM for Web Audio
function base64ToFloat32(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  // Data is 16-bit little-endian PCM
  const pcm16 = new Int16Array(bytes.buffer);
  const pcmFloat = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    pcmFloat[i] = pcm16[i] / 32768.0;
  }
  return pcmFloat;
}

let globalAudioQueue = [];
let isPlayingQueue = false;

function processAudioQueue() {
  if (!isDialogueActive) return;
  if (globalAudioQueue.length === 0) {
    isPlayingQueue = false;
    agentStates['mii1'] = 'LISTENING';
    agentStates['mii2'] = 'LISTENING';
    return;
  }

  isPlayingQueue = true;
  const { agent, buffer } = globalAudioQueue.shift();

  // Set the agent to speaking ONLY while the audio is actively playing!
  agentStates['mii1'] = 'LISTENING';
  agentStates['mii2'] = 'LISTENING';
  agentStates[agent] = 'SPEAKING';

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  source.onended = () => {
    processAudioQueue();
  };

  source.start(0);
}

function playAudio(agent, base64Data) {
  if (!isDialogueActive) return;

  const floatData = base64ToFloat32(base64Data);
  const buffer = audioContext.createBuffer(1, floatData.length, 24000);
  buffer.getChannelData(0).set(floatData);

  globalAudioQueue.push({ agent, buffer });

  if (!isPlayingQueue) {
    processAudioQueue();
  }
}

function updateMiiVisuals(agent, now) {
  const container = document.getElementById(agent === 'mii1' ? 'theater-mii-1' : 'theater-mii-2');
  if (!container) return;

  const miiData = JSON.parse(JSON.stringify(activeMiis[agent]));
  
  // Blinking logic
  if (now - lastBlink > 4000 + Math.random() * 2000) {
    isBlinking = true;
    lastBlink = now;
  }
  if (isBlinking && now - lastBlink > 150) {
    isBlinking = false;
  }

  if (isBlinking) {
    miiData.appearance.face.eyeShape = 'sleepy';
  }

  // Mouth flapping logic
  if (agentStates[agent] === 'SPEAKING') {
    if (now - lastMouthSwap > 100) {
      const idx = Math.floor(Math.random() * MOUTH_SHAPES_SPEAKING.length);
      container.dataset.mouth = MOUTH_SHAPES_SPEAKING[idx];
      lastMouthSwap = now;
    }
    miiData.appearance.face.mouthShape = container.dataset.mouth || 'open';
  }

  container.innerHTML = renderMii(miiData);
}

function animationLoop(timestamp) {
  if (!isDialogueActive) return;

  updateMiiVisuals('mii1', timestamp);
  updateMiiVisuals('mii2', timestamp);

  requestAnimationFrame(animationLoop);
}
