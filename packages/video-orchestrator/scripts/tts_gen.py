#!/usr/bin/env python3
"""
Free TTS generator for LUXOR9 Video Pipeline.
Usage:
  python tts_gen.py --text "Hello world" --voice "en-US" --output /path/to/output.mp3
  python tts_gen.py --text "Hello" --engine bark --voice "v2/en_speaker_6" --output out.mp3

Engines:
  - gtts:  Google Text-to-Speech (fast, no deps, decent quality)
  - edge:  Microsoft Edge TTS (better, requires edge-tts)
  - bark:  Suno Bark (best, emotional, requires bark+pip deps)
"""
import argparse
import json
import os
import sys

def gtts_gen(text: str, lang: str, output: str):
    try:
        from gtts import gTTS
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(output)
        print(json.dumps({"success": True, "output": output, "engine": "gtts"}))
    except ImportError:
        print(json.dumps({"success": False, "error": "gTTS not installed. Run: pip install gtts"}))

def edge_gen(text: str, voice: str, output: str):
    import asyncio
    import edge_tts
    async def _run():
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output)
        print(json.dumps({"success": True, "output": output, "engine": "edge"}))
    asyncio.run(_run())

def bark_gen(text: str, voice: str, output: str):
    try:
        from bark import SAMPLE_RATE, generate_audio, preload_models
        preload_models()
        audio_array = generate_audio(text, history_prompt=voice)
        from scipy.io.wavfile import write as write_wav
        write_wav(output, SAMPLE_RATE, audio_array)
        print(json.dumps({"success": True, "output": output, "engine": "bark"}))
    except ImportError:
        print(json.dumps({"success": False, "error": "Bark not installed. Run: pip install bark scipy"}))

def main():
    parser = argparse.ArgumentParser(description="LUXOR9 Free TTS Generator")
    parser.add_argument("--text", help="Text to speak (inline)")
    parser.add_argument("--text-file", help="Path to text file to speak")
    parser.add_argument("--engine", default="gtts", choices=["gtts", "edge", "bark"], help="TTS engine")
    parser.add_argument("--voice", default="en-US", help="Voice/language for gtts, or voice preset for bark/edge")
    parser.add_argument("--output", required=True, help="Output audio file path (.mp3 or .wav)")
    args = parser.parse_args()

    text = args.text
    if args.text_file:
        with open(args.text_file, "r", encoding="utf-8") as f:
            text = f.read()
    if not text:
        print(json.dumps({"success": False, "error": "No text provided. Use --text or --text-file."}))
        sys.exit(1)

    if args.engine == "gtts":
        lang = args.voice if len(args.voice) <= 5 else "en"
        gtts_gen(text, lang, args.output)
    elif args.engine == "edge":
        edge_gen(text, args.voice, args.output)
    elif args.engine == "bark":
        bark_gen(text, args.voice, args.output)

if __name__ == "__main__":
    import json
    main()
