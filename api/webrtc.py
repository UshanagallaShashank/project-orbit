"""
WHAT: WebRTC peer connection + audio-to-text bridge via Gemini 2.5 Flash.
      Browser sends recorded audio (base64) over a data channel.
      Server decodes it → sends to Gemini → returns text → browser speaks it.

WHY:  Uses RTCDataChannel, not audio tracks, so it works WITHOUT Gemini Live API.
      When Live API access is granted, swap _process_audio() for run_live() streaming.
      WebRTC = UDP transport (low latency), built-in NAT traversal via STUN.

LIBS: aiortc  — Python WebRTC: ICE, DTLS, data channels
      google.genai — Gemini 2.5 Flash multimodal (accepts audio blobs)
      base64  — decode audio sent from browser as base64 string
"""

import asyncio
import base64
import os

from aiortc import RTCPeerConnection, RTCSessionDescription
from google import genai
from google.genai import types

# All active peer connections — needed to close them cleanly on shutdown
_pcs: set[RTCPeerConnection] = set()


def _gemini_client():
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


async def _process_audio(audio_b64: str) -> str:
    """
    Decode base64 audio → send to Gemini 2.5 Flash → return text response.
    Gemini accepts audio/webm natively — no server-side STT needed.
    When Live API is available, replace this with run_live() for true streaming.
    """
    audio_bytes = base64.b64decode(audio_b64)
    client = _gemini_client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part(inline_data=types.Blob(data=audio_bytes, mime_type="audio/webm;codecs=opus")),
            types.Part(text="You are Orbit, a personal AI voice assistant. Reply naturally and concisely."),
        ],
    )
    return response.text


def _attach_data_channel(channel):
    """Wire up a data channel: receive audio → call Gemini → reply with text."""

    @channel.on("message")
    async def on_message(message):
        try:
            text = await _process_audio(message)
            channel.send(text)
        except Exception as e:
            channel.send(f"[error] {e}")


async def handle_offer(sdp: str, type_: str, runner=None, session=None) -> dict:
    """
    One-time SDP handshake. Browser calls this once to establish the WebRTC tunnel.
    After this function returns, audio flows over UDP — no more HTTP involved.
    runner/session are reserved for Live API integration later.
    """
    pc = RTCPeerConnection()
    _pcs.add(pc)

    # Browser creates the data channel in the offer — we receive it here
    @pc.on("datachannel")
    def on_datachannel(channel):
        _attach_data_channel(channel)

    @pc.on("connectionstatechange")
    async def on_state():
        if pc.connectionState in ("failed", "closed", "disconnected"):
            _pcs.discard(pc)

    await pc.setRemoteDescription(RTCSessionDescription(sdp=sdp, type=type_))
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}


async def close_all():
    """Call on server shutdown to release all UDP sockets cleanly."""
    if _pcs:
        await asyncio.gather(*[pc.close() for pc in list(_pcs)])
    _pcs.clear()
