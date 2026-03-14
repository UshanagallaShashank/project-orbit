"""
WHAT: Bridges browser WebSocket ↔ ADK LiveRequestQueue ↔ Gemini Live.
WHY:  ADK streaming needs two concurrent async loops — upstream and downstream.
      Isolated here so if Google changes the ADK API, this is the only file to fix.
LIBS: google-adk  — provides LiveRequestQueue, Runner, RunConfig
      google-genai — provides types.Blob for sending raw audio bytes
      asyncio      — runs upstream + downstream loops at the same time
"""

import asyncio
from google.adk.runners import InMemoryRunner
from google.adk.agents.live_request_queue import LiveRequestQueue
from google.adk.agents.run_config import RunConfig
from google.genai import types
from google.genai.types import Modality
from agents.orchestrator import root_agent  # built in agents/ step
from api.logger import log_turn

# One shared runner — InMemoryRunner keeps session state in RAM (fine for Cloud Run single instance)
# Swap to DatabaseSessionService later when you need multi-instance or persistence
runner = InMemoryRunner(agent=root_agent, app_name="orbit")

async def handle_session(ws):
    session = await runner.session_service.create_session(app_name="orbit", user_id="default")
    queue = LiveRequestQueue()

    # Modality.AUDIO = voice responses. Add Modality.TEXT if you want text replies alongside audio.
    run_config = RunConfig(response_modalities=[Modality.AUDIO], enable_affective_dialog=True)

    async def upstream():
        # Receive audio chunks (binary) or text (JSON) from the browser and push into ADK
        async for msg in ws.iter_bytes():
            queue.send_realtime(types.Blob(data=msg, mime_type="audio/pcm;rate=16000"))

    async def downstream():
        # Iterate events coming out of Gemini — forward audio bytes and transcript text to browser
        async for event in runner.run_live(session=session, live_request_queue=queue, run_config=run_config):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        await ws.send_json({"type": "transcript", "text": part.text, "role": event.content.role})
                    if part.inline_data:
                        await ws.send_bytes(part.inline_data.data)
            if event.usage_metadata:
                await log_turn(str(session.id), event)

    await asyncio.gather(upstream(), downstream())
    queue.close()
