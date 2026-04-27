import asyncio
import json
import os
import base64
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from google import genai
from google.genai import types

# Load local .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = "gemini-3.1-flash-live-preview"

class AgentState:
    IDLE = "IDLE"
    LISTENING = "LISTENING"
    SPEAKING = "SPEAKING"
    INTERRUPTED = "INTERRUPTED"

def make_config(name: str, voice: str, personality: str) -> types.LiveConnectConfig:
    system_instruction = f"Your name is {name}. {personality} Keep your responses very concise. Speak a maximum of 2 to 3 short sentences per turn."
    return types.LiveConnectConfig(
        system_instruction=types.Content(
            parts=[types.Part.from_text(text=system_instruction)]
        ),
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name=voice
                )
            )
        ),
        response_modalities=[types.Modality.AUDIO],
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        realtime_input_config=types.RealtimeInputConfig(
            turn_coverage="TURN_INCLUDES_ONLY_ACTIVITY",
        ),
    )

async def receive_from_agent(agent_id: str, session, websocket: WebSocket, other_session):
    audio_queue = asyncio.Queue()

    async def _producer():
        try:
            # session.receive() yields responses for ONE model turn then exits.
            # We must restart it in a loop to keep listening for future turns
            # (this matches the pattern in the reference orchestrator).
            while True:
                async for response in session.receive():
                    await audio_queue.put(response)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Producer error {agent_id}: {e}")
        finally:
            print(f"[{agent_id}] Receive loop ended!")
            await audio_queue.put(None)

    async def _consumer():
        try:
            current_text = ""
            while True:
                response = await audio_queue.get()
                if response is None:
                    break
                
                server_content = response.server_content
                if server_content is None:
                    continue

                if server_content.interrupted:
                    await websocket.send_json({"type": "state", "agent": agent_id, "state": AgentState.INTERRUPTED})
                    await websocket.send_json({"type": "state", "agent": agent_id, "state": AgentState.LISTENING})
                    continue

                if server_content.turn_complete:
                    if current_text.strip():
                        transcript = current_text.strip()
                        await websocket.send_json({"type": "transcript", "agent": agent_id, "text": transcript})
                        
                        # Explicitly tell the other agent what was said and yield the turn
                        prompt = f"[{agent_id} said:] {transcript}"
                        await other_session.send_realtime_input(text=prompt)
                        
                        current_text = ""
                        
                    await websocket.send_json({"type": "state", "agent": agent_id, "state": AgentState.LISTENING})
                    continue

                if server_content.model_turn and server_content.model_turn.parts:
                    for part in server_content.model_turn.parts:
                        if part.inline_data and part.inline_data.data:
                            audio_bytes = part.inline_data.data
                            
                            # 1. Send to frontend for playback
                            b64_audio = base64.b64encode(audio_bytes).decode('utf-8')
                            await websocket.send_json({"type": "audio", "agent": agent_id, "data": b64_audio})
                            
                            # 2. Set state to speaking
                            await websocket.send_json({"type": "state", "agent": agent_id, "state": AgentState.SPEAKING})

                if server_content.output_transcription and server_content.output_transcription.text:
                    current_text += server_content.output_transcription.text
                    await websocket.send_json({"type": "transcript_partial", "agent": agent_id, "text": current_text})
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Consumer error {agent_id}: {e}")

    await asyncio.gather(_producer(), _consumer())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not set on server. Rejecting connection.")
        await websocket.send_json({"type": "error", "message": "GEMINI_API_KEY not set on server."})
        await websocket.close()
        return

    client = genai.Client(api_key=api_key)

    try:
        # Wait for initialization config from frontend
        init_data = await websocket.receive_json()
        
        agent1_config = make_config(
            init_data["mii1"]["name"],
            init_data["mii1"]["voice"],
            init_data["mii1"]["personality"]
        )
        agent2_config = make_config(
            init_data["mii2"]["name"],
            init_data["mii2"]["voice"],
            init_data["mii2"]["personality"]
        )
        topic = init_data.get("topic", "Introduce yourselves!")

        await websocket.send_json({"type": "system", "message": "Connecting to Gemini Live..."})

        async with client.aio.live.connect(model=MODEL, config=agent1_config) as session1:
            async with client.aio.live.connect(model=MODEL, config=agent2_config) as session2:
                
                await websocket.send_json({"type": "system", "message": "Agents connected! Starting conversation..."})
                
                # Kick off conversation by prompting Agent 1
                prompt = f"DIRECTOR'S NOTE: We are live. The topic is: {topic}. Start the conversation."
                await session1.send_realtime_input(text=prompt)
                await websocket.send_json({"type": "state", "agent": "mii1", "state": AgentState.SPEAKING})
                await websocket.send_json({"type": "state", "agent": "mii2", "state": AgentState.LISTENING})

                # Start receive loops
                async def wrapped_receive(agent_id, session, ws, other_session):
                    print(f"[{agent_id}] Starting receive loop")
                    await receive_from_agent(agent_id, session, ws, other_session)
                    print(f"[{agent_id}] Receive loop ended!")

                task1 = asyncio.create_task(wrapped_receive("mii1", session1, websocket, session2))
                task2 = asyncio.create_task(wrapped_receive("mii2", session2, websocket, session1))

                # Keep connection alive and wait for disconnect
                while True:
                    await websocket.receive_text() # e.g. ping
                    
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
