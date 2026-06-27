import os
import sys
import json
from pathlib import Path
# Add current directory to Python path
sys.path.insert(0, os.getcwd())
print("="*70)
print("OpenMontage Zero-Cost Trial Demonstration")
print("="*70)
# Check current directory
current_dir = Path.cwd()
print(f"Working directory: {current_dir}")
print(f"Is OpenMontage directory: {'OpenMontage' in str(current_dir)}")
# Check for pipeline definitions
pipeline_dir = Path("pipeline_defs")
if pipeline_dir.exists():
    print(f"\n✓ Pipeline definitions directory exists")
    pipelines = list(pipeline_dir.glob("*.yaml"))
    print(f"  Found {len(pipelines)} pipeline definitions:")
    
    # Show some example pipelines
    example_pipelines = [
        "animated-explainer.yaml",
        "documentary-montage.yaml", 
        "animation.yaml",
        "character-animation.yaml"
    ]
    
    for pipeline in example_pipelines:
        pipeline_path = pipeline_dir / pipeline
        if pipeline_path.exists():
            print(f"    ✓ {pipeline}")
        else:
            print(f"    ✗ {pipeline} (not found)")
else:
    print(f"\n✗ Pipeline definitions directory not found at: {pipeline_dir}")
# Check for tools
tools_dir = Path("tools")
if tools_dir.exists():
    print(f"\n✓ Tools directory exists")
    # Count Python tool files
    tool_files = list(tools_dir.rglob("*.py"))
    print(f"  Found {len(tool_files)} Python tool files")
    
    # Show tool categories
    tool_categories = set()
    for tool_file in tool_files:
        if tool_file.parent.name != "tools":
            tool_categories.add(tool_file.parent.name)
    
    print(f"  Tool categories: {', '.join(sorted(tool_categories)[:10])}")
    if len(tool_categories) > 10:
        print(f"    ... and {len(tool_categories) - 10} more categories")
else:
    print(f"\n✗ Tools directory not found at: {tools_dir}")
# Check for skills
skills_dir = Path("skills")
if skills_dir.exists():
    print(f"\n✓ Skills directory exists")
    skill_files = list(skills_dir.rglob("*.md"))
    print(f"  Found {len(skill_files)} skill files")
else:
    print(f"\n✗ Skills directory not found at: {skills_dir}")
# Check environment
env_file = Path(".env")
if env_file.exists():
    print(f"\n✓ Environment file exists")
    # Show if it has API keys
    with open(env_file, 'r') as f:
        content = f.read()
        has_api_keys = any(key_line for key_line in content.split('\n') 
                          if "API_KEY" in key_line or "_KEY=" in key_line)
        
        if has_api_keys:
            print("  Contains API keys (some capabilities unlocked)")
        else:
            print("  No API keys found (zero-cost mode)")
else:
    print(f"\n✗ Environment file not found")
    print("  Creating minimal .env for zero-cost trial...")
    
    minimal_env = """# OpenMontage - Minimal .env for zero-cost trial
# Free tools available without API keys:
# - Piper TTS (free offline text-to-speech)
# - Archive.org, NASA, Wikimedia Commons (free footage)
# - Remotion composition engine
# - FFmpeg post-production
# Add API keys below as needed:
# FAL_KEY=your-key-here               # FLUX images + Google Veo, Kling video
# PEXELS_API_KEY=your-key-here        # Free stock footage (free developer key)
# PIXABAY_API_KEY=your-key-here       # Free stock footage (free developer key)
# UNSPLASH_ACCESS_KEY=your-key-here   # Free stock images (free developer key)
# OPENAI_API_KEY=your-key-here        # OpenAI TTS, DALL-E 3 images
# ELEVENLABS_API_KEY=your-key-here    # Premium TTS
# SUNO_API_KEY=your-key-here          # AI music generation
"""
    
    with open(env_file, 'w') as f:
        f.write(minimal_env)
    print(f"  ✓ Created minimal .env file")
# Check for Node.js/Remotion
remotion_dir = Path("remotion-composer")
if remotion_dir.exists():
    print(f"\n✓ Remotion composer directory exists")
    package_json = remotion_dir / "package.json"
    if package_json.exists():
        print("  package.json found")
    else:
        print("  package.json not found (npm install needed)")
else:
    print(f"\n✗ Remotion composer directory not found")
# Demonstrate workflow
print("\n" + "="*70)
print("ZERO-COST WORKFLOW DEMONSTRATION")
print("="*70)
print("\n1. PROMPT (paste into your AI coding assistant):")
print('   "Make a 45-second animated explainer about why the sky is blue"')
print("\n2. WHAT HAPPENS NEXT:")
print("   ┌─────────────────────────────────────────────────────┐")
print("   │ 1. Research Phase                                   │")
print("   │    - Searches web for scientific explanations       │")
print("   │    - Finds visual references & data points          │")
print("   │    - Creates research brief with citations          │")
print("   └─────────────────────────────────────────────────────┘")
print("   ┌─────────────────────────────────────────────────────┐")
print("   │ 2. Script Writing                                   │")
print("   │    - Writes 45-second narration script              │")
print("   │    - Adds speaker directions for TTS                │")
print("   │    - Includes enhancement cues for visuals          │")
print("   └─────────────────────────────────────────────────────┘")
print("   ┌─────────────────────────────────────────────────────┘")
print("   │ 3. Asset Generation                                 │")
print("   │    - Uses Piper TTS for free narration              │")
print("   │    - Gets images from free sources                  │")
print("   │    - Finds royalty-free background music            │")
print("   └─────────────────────────────────────────────────────┘")
print("   ┌─────────────────────────────────────────────────────┐")
print("   │ 4. Composition & Rendering                          │")
print("   │    - Creates scene plan with animations             │")
print("   │    - Renders with Remotion engine                   │")
print("   │    - Adds word-level subtitles                      │")
print("   └─────────────────────────────────────────────────────┘")
print("\n3. EXPECTED OUTPUT:")
print("   - 45-second MP4 video file")
print("   - Professional narration (Piper TTS)")
print("   - Animated visuals explaining Rayleigh scattering")
print("   - Word-level subtitles")
print("   - Royalty-free background music")
print("\n4. TOTAL COST: $0.00 (no API keys needed)")
print("\n" + "="*70)
print("READY TO START!")
print("="*70)
print("\nTo begin:")
print("1. Open E:\\OpenMontage in your AI coding assistant")
print("2. Paste the prompt above")
print("3. Let the agent guide you through the process")
print("\nNeed help? Check AGENT_GUIDE.md for detailed instructions")